"""Gemini API integration for generating debate arguments and summaries."""
import json
import logging
from typing import Dict, List, Any, Optional
import google.generativeai as genai
from app.config import GOOGLE_API_KEY

logger = logging.getLogger(__name__)

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# Using Gemini 2.5 Flash - free tier model
MODEL_NAME = "gemini-2.5-flash"


async def generate_debate(topic: str) -> Dict[str, List[str]]:
    """
    Generate debate arguments using Gemini 2.5 Flash API (free tier).
    
    Returns:
        {
            "for": ["argument1", "argument2", "argument3"],
            "against": ["argument1", "argument2", "argument3"]
        }
    """
    if not GOOGLE_API_KEY:
        logger.warning("GOOGLE_API_KEY not set, returning placeholder arguments")
        return _get_placeholder_arguments(topic)
    
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        
        prompt = f"""Generate a structured debate on: "{topic}"

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{{
    "for": ["argument 1 supporting the topic", "argument 2 supporting the topic", "argument 3 supporting the topic"],
    "against": ["argument 1 against the topic", "argument 2 against the topic", "argument 3 against the topic"]
}}

Make arguments concise, distinct, and logical."""
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        response_text = response_text.strip()
        
        # Parse JSON response
        result = json.loads(response_text)
        
        # Validate structure
        if not isinstance(result, dict) or "for" not in result or "against" not in result:
            logger.error(f"Invalid response structure: {result}")
            return _get_placeholder_arguments(topic)
        
        # Ensure lists are strings
        result["for"] = [str(arg) for arg in result["for"]]
        result["against"] = [str(arg) for arg in result["against"]]
        
        return result
    
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini response as JSON: {e}")
        return _get_placeholder_arguments(topic)
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        return _get_placeholder_arguments(topic)


async def generate_summary(arguments: List[str]) -> str:
    """
    Generate a neutral summary of debate arguments using Gemini 2.5 Flash.
    
    Args:
        arguments: List of argument strings
    
    Returns:
        Summary string
    """
    if not GOOGLE_API_KEY:
        logger.warning("GOOGLE_API_KEY not set, returning placeholder summary")
        return "Summary: This debate presents multiple perspectives on the topic at hand."
    
    try:
        if not arguments:
            return "No arguments provided for summary."
        
        model = genai.GenerativeModel(MODEL_NAME)
        
        args_text = "\n".join([f"- {arg}" for arg in arguments])
        prompt = f"""Summarize the following debate arguments in a neutral, concise manner (2-3 sentences):

{args_text}

Provide only the summary, no additional text."""
        
        response = model.generate_content(prompt)
        summary = response.text.strip()
        
        return summary if summary else "Summary unavailable."
    
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        return "Summary could not be generated."


def _get_placeholder_arguments(topic: str) -> Dict[str, List[str]]:
    """Fallback placeholder when API is unavailable."""
    return {
        "for": [
            f"Supporting arguments that favor the position on {topic}",
            f"Evidence-based reasoning for {topic}",
            f"Practical benefits of {topic}",
        ],
        "against": [
            f"Counterarguments opposing {topic}",
            f"Potential risks or downsides of {topic}",
            f"Alternative perspectives to consider",
        ],
    }
