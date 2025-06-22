# Debug Guide: JSON Decoding and API Key Issues

## Fixed Issues ✅

### 1. JSON Decoding Error
**Problem**: `Failed to decode JSON: Expecting value: line 1 column 1 (char 0)`

**Root Cause**: The AI model was responding with conversational text instead of JSON format.

**Fixes Applied**:
- ✅ Improved prompt structure to be more direct and specific
- ✅ Added system instructions to enforce JSON-only responses  
- ✅ Enhanced error handling with retry logic
- ✅ Added fallback JSON extraction from mixed content
- ✅ Better logging for debugging model responses

### 2. API Key Issues
**Problem**: `API key not valid. Please pass a valid API key.`

**Root Cause**: Missing or invalid Google AI API key configuration.

**Fixes Applied**:
- ✅ Enhanced API key validation and error messages
- ✅ Better error handling for different API key issues
- ✅ Improved logging for API key problems

## How to Resolve API Key Issues

### Step 1: Get a Valid API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" 
4. Create a new API key or use an existing one
5. Copy the API key

### Step 2: Set Environment Variable
Create a `.env` file in the `ai-server` directory:

```bash
# ai-server/.env
GOOGLE_API_KEY=your_actual_api_key_here
```

**Important**: Replace `your_actual_api_key_here` with your actual API key from Google AI Studio.

### Step 3: Verify API Key
Run the test script to verify your API key works:

```bash
cd ai-server
source venv/bin/activate
python test_json_fix.py
```

### Step 4: Check API Usage
If you get quota errors:
1. Check your usage at [Google AI Studio](https://aistudio.google.com/)
2. Ensure you're within the free tier limits
3. Consider upgrading if needed

## Testing the Fixes

### Run the Test Script
```bash
cd ai-server
source venv/bin/activate
python test_json_fix.py
```

### Start the Server
```bash
cd ai-server
source venv/bin/activate
python app.py
```

### Test the API
```bash
curl -X POST http://localhost:6000/v1/course-genration-outline \
  -H "Content-Type: application/json" \
  -d '{"input_text": "machine learning"}'
```

## What Was Fixed

### router.py
- ✅ Enhanced JSON parsing with multiple fallback strategies
- ✅ Added retry logic for conversational responses
- ✅ Better error handling and logging
- ✅ Regex-based JSON extraction from mixed content

### promts.py  
- ✅ Rewrote prompt to be more direct and specific
- ✅ Added clear JSON format requirements
- ✅ Removed ambiguous instructions

### app.py
- ✅ Added system instructions for JSON responses
- ✅ Enhanced API key validation
- ✅ Better generation parameters for consistent output
- ✅ Improved error messages for different failure modes

## Expected Behavior Now

1. **API Key Valid**: Model generates proper JSON responses
2. **JSON Parsing**: Handles various response formats gracefully
3. **Fallbacks**: Uses reasonable defaults when AI fails
4. **Logging**: Clear error messages for debugging

## Troubleshooting

### Still Getting JSON Errors?
1. Check the logs for raw model responses
2. Verify your API key is working with the test script
3. Check if the model is returning expected format

### Still Getting API Key Errors?
1. Verify your `.env` file exists and has the correct API key
2. Restart the server after updating the API key
3. Check Google AI Studio for any account issues

### Need More Help?
Check the detailed logs in the console output for specific error messages and stack traces. 