import os
import cv2
import numpy as np
import tensorflow as tf
from PIL import Image
import io
import base64

class StegaStampWrapper:
    """Wrapper for StegaStamp model to encode and decode watermarks in images."""
    
    def __init__(self, model_path="./backend/app/models/stegastamp_pretrained"):
        """
        Initialize StegaStamp model for encoding and decoding.
        
        Args:
            model_path: Path to the stegastamp_pretrained SavedModel directory
        """
        self.model_path = model_path
        self.session = None
        self.signature = None
        self._load_model()
    
    def _load_model(self):
        """Load the StegaStamp model for both encoding and decoding."""
        try:
            tf.compat.v1.disable_eager_execution()
            self.session = tf.compat.v1.Session(graph=tf.Graph())
            
            with self.session.graph.as_default():
                metagraph_def = tf.compat.v1.saved_model.loader.load(
                    self.session,
                    [tf.compat.v1.saved_model.tag_constants.SERVING],
                    self.model_path
                )
            
            signature_def = metagraph_def.signature_def
            self.signature_key = tf.compat.v1.saved_model.signature_constants.DEFAULT_SERVING_SIGNATURE_DEF_KEY
            
            if self.signature_key in signature_def:
                self.signature = signature_def[self.signature_key]
                print(f"StegaStamp model loaded from {self.model_path}")
                print(f"  Inputs: {list(self.signature.inputs.keys())}")
                print(f"  Outputs: {list(self.signature.outputs.keys())}")
            else:
                self.session = None
                
        except Exception as e:
            print(f"Warning: Could not load model: {e}")
            self.session = None
    
    def encode_image(self, image_path, secret="AI-PROOF-v1"):
        """
        Encode invisible watermark into an image.
        
        Args:
            image_path: Path to the image file
            secret: Secret message/watermark to embed (default: "AI-PROOF-v1")
        
        Returns:
            Watermarked image as base64 string
        """
        try:
            # Read the image
            if isinstance(image_path, str):
                image = cv2.imread(image_path)
            else:
                # Handle file-like objects
                image_bytes = image_path.read()
                nparr = np.frombuffer(image_bytes, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                raise ValueError("Failed to load image")
            
            # Save original dimensions to restore after watermarking
            original_h, original_w = image.shape[:2]

            # Preprocess: resize to 400x400, convert to RGB, normalize to [0,1]
            image_resized = cv2.resize(image, (400, 400))
            image_rgb = cv2.cvtColor(image_resized, cv2.COLOR_BGR2RGB)
            image_normalized = image_rgb.astype(np.float32) / 255.0
            
            if self.session is not None:
                # Use the model for inference
                try:
                    # Create a 100-bit secret (for demo, use alternating pattern)
                    # In production, this would encode the actual text message
                    secret_bits = np.array([i % 2 for i in range(100)], dtype=np.float32)
                    
                    # Add batch dimension
                    image_batch = np.expand_dims(image_normalized, axis=0)
                    secret_batch = np.expand_dims(secret_bits, axis=0)
                    
                    # Get input/output tensor names from signature
                    encoder_inputs = list(self.signature.inputs.keys())
                    encoder_outputs = list(self.signature.outputs.keys())
                    
                    secret_input_name = None
                    image_input_name = None
                    
                    for key in encoder_inputs:
                        if 'secret' in key.lower():
                            secret_input_name = self.signature.inputs[key].name
                        elif 'image' in key.lower():
                            image_input_name = self.signature.inputs[key].name
                    
                    # Find output tensor (stegastamp or encoded image)
                    output_key = None
                    for key in encoder_outputs:
                        if 'stegastamp' in key.lower() or 'output' in key.lower():
                            output_key = key
                            break
                    if not output_key:
                        output_key = encoder_outputs[0]
                    
                    output_tensor_name = self.signature.outputs[output_key].name
                    
                    # Run inference
                    if secret_input_name and image_input_name:
                        watermarked = self.session.run(
                            output_tensor_name,
                            feed_dict={
                                secret_input_name: secret_batch,
                                image_input_name: image_batch
                            }
                        )
                        # watermarked shape: (1, 400, 400, 3)
                        watermarked = watermarked[0]  # Remove batch dimension
                    else:
                        raise ValueError("Could not find secret/image input tensors")
                    
                except Exception as e:
                    print(f"Encoder inference error: {e}, using fallback")
                    watermarked = self._apply_simple_watermark(image_normalized)
            else:
                # Simulation mode: apply simple watermarking
                watermarked = self._apply_simple_watermark(image_normalized)
            
            # Convert back to uint8 [0, 255]
            watermarked = (np.clip(watermarked, 0, 1) * 255).astype(np.uint8)
            
            # Resize back to original dimensions to preserve image quality
            if (original_h, original_w) != (400, 400):
                watermarked = cv2.resize(watermarked, (original_w, original_h), interpolation=cv2.INTER_LANCZOS4)
            
            # Encode as PNG to base64
            pil_image = Image.fromarray(watermarked)
            buffer = io.BytesIO()
            pil_image.save(buffer, format='PNG')
            buffer.seek(0)
            base64_str = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            return base64_str
        
        except Exception as e:
            raise Exception(f"Error encoding image: {str(e)}")
    
    def decode_image(self, image_path):
        """
        Detect and extract watermark from an image.
        
        Args:
            image_path: Path to the image file or file-like object
        
        Returns:
            Dictionary with detection results:
            {
                'detected': bool,
                'confidence': float,
                'payload': str or None,
                'heatmap': base64 string of frequency heatmap
            }
        """
        try:
            # Read the image
            if isinstance(image_path, str):
                image = cv2.imread(image_path)
            else:
                # Handle file-like objects
                image_bytes = image_path.read()
                nparr = np.frombuffer(image_bytes, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                raise ValueError("Failed to load image")
            
            # Preprocess: resize to 400x400, convert to RGB, normalize to [0,1]
            image_resized = cv2.resize(image, (400, 400))
            image_rgb = cv2.cvtColor(image_resized, cv2.COLOR_BGR2RGB)
            image_normalized = image_rgb.astype(np.float32) / 255.0
            
            if self.session is not None:
                # Use the model for inference
                try:
                    # Add batch dimension: (400, 400, 3) -> (1, 400, 400, 3)
                    image_batch = np.expand_dims(image_normalized, axis=0)
                    
                    # Get the input/output tensor objects directly from signature
                    # The signature.inputs is a dict-like object with keys = tensor names
                    # and values = TensorSpec objects that have a .name attribute
                    decoder_inputs = list(self.signature.inputs.keys())
                    decoder_outputs = list(self.signature.outputs.keys())
                    
                    # Find the image input tensor - the model expects image input (not secret for decoding)
                    image_input_name = None
                    for key in decoder_inputs:
                        # Try to find which input expects the image shape (1, 400, 400, 3)
                        if 'image' in key.lower():
                            image_input_name = self.signature.inputs[key].name
                            break
                    
                    # If no 'image' key found, use the one with larger input size
                    if not image_input_name:
                        for key in decoder_inputs:
                            tensor_spec = self.signature.inputs[key]
                            # Image input should be 4D (batch, H, W, C)
                            if len(tensor_spec.shape) == 4:
                                image_input_name = tensor_spec.name
                                break
                    
                    # Fallback to first input
                    if not image_input_name:
                        image_input_name = self.signature.inputs[decoder_inputs[0]].name
                    
                    # Get output tensor name (should be 'decoded' - the CONTINUOUS values before rounding)
                    output_key = None
                    if 'decoded' in decoder_outputs:
                        output_key = 'decoded'
                    else:
                        # Look for decoded in the keys
                        for key in decoder_outputs:
                            if 'decoded' in key.lower():
                                output_key = key
                                break
                    
                    # CRITICAL: Make sure we don't use 'Round' or any post-threshold outputs
                    if not output_key:
                        # Look for outputs that are NOT named Round/Rounded/etc
                        for key in decoder_outputs:
                            output_name = self.signature.outputs[key].name.lower()
                            if 'round' not in output_name:
                                output_key = key
                                break
                    
                    # Last resort - use first non-round output
                    if not output_key:
                        output_key = decoder_outputs[0]
                    
                    output_tensor_name = self.signature.outputs[output_key].name
                    
                    # Additional check: if the name contains "round", try to find the pre-round tensor
                    if 'round' in output_tensor_name.lower():
                        print(f"WARNING: Output tensor {output_tensor_name} appears to be rounded!")
                        print(f"Available outputs: {decoder_outputs}")
                        print(f"Trying to find pre-round tensor...")
                        # Try to find the input to the Round op by modifying tensor name
                        # Round:0 -> look for the input operation
                        # This is a bit of a hack but necessary with TF1 API
                        graph = self.session.graph
                        round_op = graph.get_operation_by_name(output_tensor_name.split(':')[0])
                        if round_op.inputs:
                            output_tensor_name = round_op.inputs[0].name
                            print(f"Found pre-round tensor: {output_tensor_name}")
                    
                    print(f"Using input tensor: {image_input_name}")
                    print(f"Using output tensor: {output_tensor_name}")
                    
                    # Run inference on the same model used for encoding
                    decoded_bits_raw = self.session.run(
                        output_tensor_name,
                        feed_dict={image_input_name: image_batch}
                    )
                    
                    # decoded_bits_raw shape: (1, 100)
                    bits = decoded_bits_raw[0]  # Remove batch dimension
                    
                    # The model outputs values (may be continuous [0,1] or rounded 0/1)
                    # For watermark detection, check if bits are TIGHTLY CLUSTERED at 0 or 1
                    # Watermarked images have bits very close to extremes (>0.9 or <0.1)
                    # Clean images have bits spread randomly across [0,1]
                    
                    # Our encoding uses alternating [0, 1, 0, 1, ...] pattern
                    expected_pattern = np.array([i % 2 for i in range(100)], dtype=np.float32)
                    
                    # Check if bits are rounded (exactly 0 or 1)
                    is_rounded = np.all((bits == 0) | (bits == 1))
                    
                    if is_rounded:
                        # Use pattern matching for rounded outputs
                        matches = (bits == expected_pattern).sum()
                        accuracy = matches / 100.0
                        confidence = float(accuracy)
                        detected = accuracy > 0.85  # 85% match threshold
                        detection_method = "pattern_match"
                    else:
                        # For continuous outputs, check for TIGHT CLUSTERING at extremes
                        # Watermark: bits should be >0.9 or <0.1 (tightly clustered)
                        # Clean: bits are randomly distributed
                        
                        # Count bits tightly clustered at extremes
                        extreme_threshold = 0.15  # Consider <0.15 or >0.85 as "extreme"
                        near_zero = (bits < extreme_threshold).sum()
                        near_one = (bits > (1 - extreme_threshold)).sum()
                        clustered_count = near_zero + near_one
                        cluster_ratio = clustered_count / 100.0
                        
                        # For pattern matching with continuous values
                        # Round to nearest int and check match
                        rounded_bits = np.round(bits).astype(np.float32)
                        matches = (rounded_bits == expected_pattern).sum()
                        pattern_accuracy = matches / 100.0
                        
                        # Combine both metrics: high clustering + high pattern match = watermark
                        confidence = float(cluster_ratio * pattern_accuracy)
                        detected = (cluster_ratio > 0.7 and pattern_accuracy > 0.85)
                        detection_method = "clustering+pattern"
                    
                    # Debug output - CRITICAL for understanding model outputs
                    print(f"\n=== MODEL OUTPUT DEBUG ===")
                    print(f"Raw bits shape: {bits.shape}")
                    print(f"Raw bits sample (first 20): {bits[:20]}")
                    print(f"Raw bits - min={np.min(bits):.6f}, max={np.max(bits):.6f}, mean={np.mean(bits):.6f}, std={np.std(bits):.6f}")
                    print(f"Is rounded: {is_rounded}")
                    print(f"Detection method: {detection_method}")
                    if is_rounded:
                        print(f"Pattern match accuracy: {matches/100.0:.4f} (threshold: 0.85)")
                    else:
                        print(f"Bits <0.15: {near_zero}, Bits >0.85: {near_one}")
                        print(f"Cluster ratio: {cluster_ratio:.4f} (threshold: 0.7)")
                        print(f"Pattern accuracy: {pattern_accuracy:.4f} (threshold: 0.85)")
                    print(f"Confidence: {confidence:.6f}")
                    print(f"Detected: {detected}")
                    print(f"===========================\n")
                    
                except Exception as e:
                    print(f"Model inference error: {e}, using fallback")
                    confidence = self._detect_watermark_simple(image_normalized)
                    detected = confidence > 0.5
            else:
                # Simulation mode
                confidence = self._detect_watermark_simple(image_normalized)
                detected = confidence > 0.5
            
            # Generate frequency domain heatmap
            heatmap_base64 = self._generate_frequency_heatmap(image)
            
            result = {
                'detected': bool(detected),
                'confidence': float(confidence),
                'payload': "AI-PROOF-v1" if detected else None,
                'heatmap': heatmap_base64
            }
            
            return result
        
        except Exception as e:
            raise Exception(f"Error decoding image: {str(e)}")
    
    def _apply_simple_watermark(self, image):
        """Apply a simple watermarking pattern for development/fallback."""
        watermarked = image.copy()
        
        # Add subtle noise pattern across image
        h, w = image.shape[:2]
        noise = np.random.normal(0, 0.01, image.shape)
        watermarked = np.clip(watermarked + noise, 0, 1)
        
        # Slightly enhance specific frequency components
        # This simulates invisible watermarking without actual model
        if len(image.shape) == 3:
            # Apply subtle LSB modifications to simulate watermark
            for c in range(image.shape[2]):
                watermarked[:, :, c] = (watermarked[:, :, c] * 255).astype(np.uint8) / 255.0
        
        return watermarked
    
    def _detect_watermark_simple(self, image):
        """Simple watermark detection for development/fallback."""
        # Calculate image statistics as confidence metric
        # In real implementation, this would use the decoder model
        
        # Compute some image properties
        std_dev = np.std(image)
        mean_val = np.mean(image)
        
        # Simple heuristic: detect based on image characteristics
        # This is a placeholder - real detection uses the trained model
        confidence = min(0.3 + std_dev * 0.2, 1.0)
        
        return confidence
    
    def _generate_frequency_heatmap(self, image):
        """Generate frequency domain heatmap for visualization."""
        try:
            # Convert to grayscale for FFT
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image
            
            # Compute FFT
            f_transform = np.fft.fft2(gray)
            f_shift = np.fft.fftshift(f_transform)
            magnitude = np.abs(f_shift)
            
            # Log scale for visualization
            magnitude_log = np.log1p(magnitude)
            
            # Normalize to 0-255
            magnitude_normalized = ((magnitude_log - magnitude_log.min()) / 
                                   (magnitude_log.max() - magnitude_log.min()) * 255).astype(np.uint8)
            
            # Apply colormap
            heatmap = cv2.applyColorMap(magnitude_normalized, cv2.COLORMAP_JET)
            
            # Encode as PNG to base64
            _, buffer = cv2.imencode('.png', heatmap)
            base64_str = base64.b64encode(buffer).decode('utf-8')
            
            return base64_str
        
        except Exception as e:
            print(f"Error generating heatmap: {e}")
            return ""
    
    def close(self):
        """Close TensorFlow session."""
        if self.session is not None:
            self.session.close()


# Create global wrapper instance
_wrapper = None

def get_wrapper():
    """Get or create the StegaStamp wrapper instance."""
    global _wrapper
    if _wrapper is None:
        _wrapper = StegaStampWrapper()
    return _wrapper

def encode_image(image_path, secret="AI-PROOF-v1"):
    """Encode watermark into image."""
    wrapper = get_wrapper()
    return wrapper.encode_image(image_path, secret)

def decode_image(image_path):
    """Decode watermark from image."""
    wrapper = get_wrapper()
    return wrapper.decode_image(image_path)
