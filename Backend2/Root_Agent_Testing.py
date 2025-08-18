import os
import sys
import json
import re
import uuid
import asyncio
from datetime import datetime, timezone
from dotenv import load_dotenv
from typing import Optional

# Load environment variables from .env file
load_dotenv()

# Check if the API key is set
google_api_key = os.getenv("GOOGLE_API_KEY")
if not google_api_key:
    raise ValueError("GOOGLE_API_KEY is not set in the environment or .env file.")

# Import and configure the Google AI client
import google.generativeai as genai
genai.configure(api_key=google_api_key)

# Assuming KisanSathi is a module in your project
from KisanSathi.agent import root_agent
from KisanSathi.agent import generalized_agent
# The following imports might need to be adjusted
try:
    from google.genai import types
    from google.adk.runners import Runner
    from google.adk.sessions import InMemorySessionService
except ImportError:
    print("Google ADK libraries not found. Please install them using `pip install google-adk`.")
    sys.exit(1)


async def run_agent(query: str) -> Optional[str]:
    """
    Runs the root_agent with a given query, extracts the final response,
    and returns it as a string.
    """
    session_service = InMemorySessionService()

    # Use a unique session ID for each run
    session_id = str(uuid.uuid4())

    await session_service.create_session(
        app_name="KisanSathi",
        session_id=session_id,
        user_id="user1",
        state={"pincode": 362565}  # Example pincode, adjust as needed
    )

    agent_runner = Runner(
        app_name="KisanSathi",
        agent=root_agent,
        session_service=session_service
    )

    content = types.Content(
        role="user",
        parts=[types.Part(text=query)]
    )

    print(f"Sending query: '{query}'")

    final_response = None
    last_event_content = None

    # Iterate through the events to find the final response
    events = agent_runner.run_async(
        user_id="user1",
        session_id=session_id,
        new_message=content,
    )
    
    async for event in events:
        if event.is_final_response():
            if event.content and event.content.parts:
                last_event_content = event.content.parts[0].text

    if last_event_content:
        final_response = last_event_content
    else:
        print("No final response event found from the Sequential Agent.")
        return None

    # Clean up Markdown code block if it exists
    cleaned_response = re.sub(r"^```(?:json)?\n|```$", "", final_response.strip(), flags=re.IGNORECASE)
    
    try:
        response_data = json.loads(cleaned_response)
        return json.dumps(response_data, indent=2)
    except json.JSONDecodeError:
        return cleaned_response


if __name__ == "__main__":
    user_query = "what are whrther forcasting next 7 days"
    
    response = asyncio.run(run_agent(user_query))
    
    if response:
        print("------------------------------------------>")
        print("\nFinal Agent Response:")
        print(response)