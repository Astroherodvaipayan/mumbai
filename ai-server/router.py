import json
import logging
from promts import Promt_Genrate_topic

# Set up logging
logger = logging.getLogger(__name__)

def Genrate_Topic_SubTopic(model_function, text):
    """
    Generate topic and subtopics for a given input text
    
    Args:
        model_function: Function to call the AI model
        text: Input text to analyze
        
    Returns:
        tuple: (dominant_topic, subtopics)
    """
    try:
        # Generate the prompt with the actual text
        prompt = Promt_Genrate_topic(text)
        logger.info(f"Generated prompt for text: {text[:100]}...")
        
        # Call the model with the prompt
        response = model_function(prompt)
        
        # Handle case where model response is None or doesn't have text
        if not response:
            logger.warning("Model returned None response")
            return "General", ["Introduction", "Fundamentals", "Advanced", "Applications", "Projects"]
            
        if not hasattr(response, 'text'):
            logger.warning("Model response has no text attribute")
            return "General", ["Introduction", "Fundamentals", "Advanced", "Applications", "Projects"]
            
        raw_response = response.text
        logger.info(f"Raw model response: {raw_response[:200]}...")
        
        # Clean the response text - handle multiple formats
        clean_response = raw_response.strip()
        
        # Remove markdown code blocks if present
        if clean_response.startswith("```json"):
            clean_response = clean_response.replace("```json", "", 1)
        if clean_response.endswith("```"):
            clean_response = clean_response.replace("```", "", 1)
        
        # Remove any extra backticks
        clean_response = clean_response.strip("`").strip()
        
        # Check if response is empty or invalid
        if not clean_response or clean_response == "":
            logger.warning("Empty response after cleaning")
            return "General", ["Introduction", "Fundamentals", "Advanced", "Applications", "Projects"]

        # Check if the response looks like conversational text instead of JSON
        if any(phrase in clean_response.lower() for phrase in [
            "i understand", "please provide", "i'm ready", "okay", "let me analyze"
        ]):
            logger.warning(f"Model responded with conversational text instead of JSON: {clean_response[:100]}")
            # Try to re-prompt with more specific instructions
            specific_prompt = f"""
            IMPORTANT: You must respond ONLY with a JSON object. Do not include any other text.
            
            Analyze this specific text: "{text}"
            
            Return only this JSON format:
            {{
                "dominant_subject": "Programming|Science|Maths|Miscellaneous",
                "dominant_topic": "specific topic name",
                "subtopics": ["subtopic1", "subtopic2", "subtopic3", "subtopic4", "subtopic5"]
            }}
            """
            
            response = model_function(specific_prompt)
            if response and hasattr(response, 'text'):
                clean_response = response.text.strip().strip("`").strip()
                clean_response = clean_response.replace("```json", "").replace("```", "").strip()
            else:
                logger.warning("Second attempt also failed")
                return "General", ["Introduction", "Fundamentals", "Advanced", "Applications", "Projects"]

        # Try to parse the JSON response
        try:
            response_dict = json.loads(clean_response)
            
            # Extract fields with fallbacks
            dominant_subject = response_dict.get("dominant_subject", "General")
            dominant_topic = response_dict.get("dominant_topic", "General Topic")
            subtopics = response_dict.get("subtopics", [])
            
            # Validate and clean the results
            if not dominant_subject or dominant_subject.strip() == "":
                dominant_subject = "General"
                
            if not subtopics or len(subtopics) == 0:
                subtopics = ["Introduction", "Fundamentals", "Advanced", "Applications", "Projects"]
            
            # Ensure we have at least 3-5 subtopics
            if len(subtopics) < 3:
                subtopics.extend(["Advanced Topics", "Applications", "Projects"])
            
            # Use dominant_subject as the return value (this matches the calling code)
            logger.info(f"Successfully parsed - Subject: {dominant_subject}, Topic: {dominant_topic}, Subtopics: {subtopics}")
            return dominant_subject, subtopics[:5]  # Limit to 5 subtopics
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode JSON: {e}")
            logger.error(f"Raw response: {clean_response}")
            
            # Try to extract JSON from mixed content
            try:
                # Look for JSON-like patterns in the text
                import re
                json_pattern = r'\{[^{}]*"dominant_subject"[^{}]*\}'
                json_match = re.search(json_pattern, clean_response, re.DOTALL)
                
                if json_match:
                    potential_json = json_match.group(0)
                    response_dict = json.loads(potential_json)
                    dominant_subject = response_dict.get("dominant_subject", "General")
                    subtopics = response_dict.get("subtopics", ["Introduction", "Fundamentals", "Advanced", "Applications", "Projects"])
                    logger.info(f"Extracted JSON from mixed content - Subject: {dominant_subject}")
                    return dominant_subject, subtopics[:5]
            except:
                pass
            
            # Final fallback
            logger.warning("Using fallback values due to JSON parsing failure")
            return "General", ["Introduction", "Fundamentals", "Advanced", "Applications", "Projects"]
            
    except Exception as e:
        logger.error(f"Error in topic generation: {e}")
        return "General", ["Introduction", "Fundamentals", "Advanced", "Applications", "Projects"]
