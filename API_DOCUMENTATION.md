# AI Tutor 2.0 - Chrome Extension API Documentation

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `[Your production URL will go here]`

---

## Endpoint: Upload Transcript

**POST** `/api/transcript/upload`

Upload classroom transcripts from Chrome extension to AI Tutor backend.

### Authentication

This endpoint does **NOT** require user authentication (no Bearer token needed). Instead, it validates the `teacherCode` field to ensure the teacher exists in the system.

### Rate Limiting

- **Limit**: 10 requests per teacher code per 15 minutes
- **Headers Returned**:
  - `X-RateLimit-Limit`: Maximum requests allowed in window
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Unix timestamp when the window resets
  - `Retry-After`: Seconds to wait before retrying (only on 429 errors)

### Request Headers
```http
Content-Type: application/json
Origin: chrome-extension://[your-extension-id]
```

### Request Body
```json
{
  "teacherCode": "TEACH001",
  "courseName": "Introduction to Computer Science",
  "lessonTitle": "Lesson 5: Data Structures",
  "transcript": "Today we will discuss arrays and linked lists...",
  "capturedAt": "2025-11-03T14:30:00.000Z",
  "metadata": {
    "duration": 3600,
    "source": "Google Meet"
  }
}
```

### Request Body Schema

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `teacherCode` | string | ✅ Yes | Must match pattern `TEACH###` (e.g., TEACH001) | Unique teacher identifier |
| `courseName` | string | ✅ Yes | 1-200 characters | Name of the course |
| `lessonTitle` | string | ✅ Yes | 1-200 characters | Title of the lesson |
| `transcript` | string | ✅ Yes | 10-100,000 characters | Raw transcript text |
| `capturedAt` | string | ✅ Yes | ISO 8601 datetime format | When the transcript was captured |
| `metadata` | object | ❌ No | Optional object | Additional metadata |
| `metadata.duration` | number | ❌ No | Seconds | Duration of the recording |
| `metadata.source` | string | ❌ No | Text | Source of the recording (e.g., "Zoom", "Google Meet") |

### Response: Success (New Transcript)

**Status Code**: `201 Created`
```json
{
  "success": true,
  "action": "created",
  "message": "New pending transcript created",
  "pendingTranscriptId": "clx7h8k9m0000xyz123456789"
}
```

### Response: Success (Appended to Existing)

**Status Code**: `200 OK`

**Note**: If a transcript with the same teacher, course name, and lesson title was uploaded within the last 2 hours, the new transcript will be appended to the existing one instead of creating a new entry.
```json
{
  "success": true,
  "action": "appended",
  "message": "Transcript appended to existing pending transcript",
  "pendingTranscriptId": "clx7h8k9m0000xyz123456789"
}
```

### Response: Validation Error

**Status Code**: `400 Bad Request`
```json
{
  "error": "Validation failed",
  "details": {
    "teacherCode": {
      "_errors": ["Invalid teacher code format (expected: TEACH###)"]
    },
    "transcript": {
      "_errors": ["Transcript must be at least 10 characters"]
    }
  }
}
```

### Response: Teacher Not Found

**Status Code**: `404 Not Found`
```json
{
  "error": "Invalid teacher code - teacher not found"
}
```

### Response: Rate Limit Exceeded

**Status Code**: `429 Too Many Requests`
```json
{
  "error": "Too many requests",
  "message": "Too many transcript uploads. Please wait before uploading again.",
  "retryAfter": 450
}
```

**Headers**:
```http
Retry-After: 450
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1699027800
```

### Response: Server Error

**Status Code**: `500 Internal Server Error`
```json
{
  "error": "Failed to upload transcript"
}
```

---

## Example Request (JavaScript/Fetch)
```javascript
// Example from Chrome extension
const uploadTranscript = async (teacherCode, courseName, lessonTitle, transcript) => {
  try {
    const response = await fetch('http://localhost:3000/api/transcript/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        teacherCode: teacherCode,
        courseName: courseName,
        lessonTitle: lessonTitle,
        transcript: transcript,
        capturedAt: new Date().toISOString(),
        metadata: {
          source: 'Chrome Extension',
          duration: 3600, // Optional: add if you track duration
        },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Upload successful:', data);
      return data;
    } else if (response.status === 429) {
      console.error('Rate limit exceeded. Retry after:', data.retryAfter, 'seconds');
      throw new Error(`Rate limited. Retry in ${data.retryAfter} seconds`);
    } else {
      console.error('Upload failed:', data);
      throw new Error(data.error || 'Upload failed');
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};
```

---

## Important Notes for Extension Developers

### 1. Teacher Code Format

- **Format**: `TEACH###` where `###` is a 3-digit number (e.g., TEACH001, TEACH042)
- **NOT teacher name**: The extension must send the teacher code, not the teacher's name
- Teachers can find their code in the AI Tutor web application dashboard

### 2. Transcript Appending Logic

The backend automatically handles multiple uploads for the same lesson:

- If you upload a transcript with the same `teacherCode`, `courseName`, and `lessonTitle` within 2 hours of a previous upload, it will be **appended** to the existing transcript
- This allows teachers to upload mid-lesson and then again at the end
- The separator `\n\n--- Continued ---\n\n` is automatically added between appended sections

### 3. CORS Configuration

- The backend allows requests from `chrome-extension://*` origins
- Ensure your extension's `manifest.json` includes the API URL in `host_permissions`:
```json
{
  "host_permissions": [
    "http://localhost:3000/*",
    "[production-url]/*"
  ]
}
```

### 4. Error Handling

Always handle these scenarios in your extension:

- **Network errors**: User might be offline
- **Rate limiting**: Show user a friendly message with retry time
- **Invalid teacher code**: Prompt user to check their teacher code
- **Validation errors**: Show specific field errors to help user correct input

### 5. Testing

For testing during development:

1. Get a valid teacher code from the AI Tutor dashboard (login as teacher or admin)
2. Use the mock extension page at `http://localhost:3000/mock-extension`
3. Or use tools like Postman/curl to test the endpoint directly

---

## Testing with cURL
```bash
curl -X POST http://localhost:3000/api/transcript/upload \
  -H "Content-Type: application/json" \
  -H "Origin: chrome-extension://test" \
  -d '{
    "teacherCode": "TEACH001",
    "courseName": "Test Course",
    "lessonTitle": "Test Lesson",
    "transcript": "This is a test transcript with enough characters to pass validation.",
    "capturedAt": "2025-11-03T14:30:00.000Z"
  }'
```

---

## Questions or Issues?

Contact: Matthew

**Last Updated**: November 3, 2025
