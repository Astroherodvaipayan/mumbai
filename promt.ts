export const CHECKER = (input: string) => {
    return `Validate and extract course "${input}". Ensure the content adheres strictly to the following regulations:

No courses related to human, animal, or bird biology should be accepted, unless pertaining to poisonous or dangerous plants to living organisms.
Strict filtering for any violations or inappropriate content is mandatory.
Output should follow a JSON structure with the following keys:
"message": Course evaluation result message.
"coursename": Extracted and purified course name.
"safe": Boolean (true or false) indicating if the course is acceptable.
Regulations:

Biology courses related to human, animal, or bird operations and practices are strictly prohibited, except those involving information about poisonous or dangerous plants to living organisms.
Ensure the output JSON structure contains the correct keys (message, coursename, safe).
Flagged the topics that are not educational courses, such as general knowledge queries, current events, or non-academic subjects.
Filter out inputs that contain irrelevant information, including personal queries, factual questions, or speculative topics.
Any study/course through Data is allowed.
The message key should indicate if the course input is acceptable or specify the violation.
The coursename key should contain only the extracted course name without any additional information.
Set safe to true if the course is acceptable; set to false if there is a violation.`
}

export const GENRATE_OUTLINE = (input: string) => {
    // Extract the actual course topic from the input text if it's in a complex prompt
    let courseTopic = input;
    if (input.includes('"')) {
        const match = input.match(/"([^"]+)"/);
        if (match) {
            courseTopic = match[1];
        }
    } else if (input.toLowerCase().includes("on ")) {
        // Try to extract topic after "on"
        const parts = input.split(/on\s+/i, 2);
        if (parts.length > 1 && parts[1].trim()) {
            courseTopic = parts[1].trim();
        }
    }
    
    return `Develop a comprehensive course on the topic "${courseTopic}". The duration of the course will be determined based on optimal learning conditions, ranging from 3 to 7 days. Each day should be divided into 3 modules.

Design the course with the following components in a valid JSON structure:
{
  "name": "Short Course Name",
  "domain": "Subject Area (e.g., Programming, Science, Math, etc.)",
  "numberofdays": 5,
  "Introduction": ["Brief introduction to the course and its objectives"],
  "modules": [
    {"day": 1, "title": "Fundamentals"},
    {"day": 2, "title": "Core Concepts"},
    {"day": 3, "title": "Advanced Topics"},
    {"day": 4, "title": "Practical Applications"},
    {"day": 5, "title": "Projects"}
  ],
  "Day 1": ["Module 1: Introduction", "Module 2: Basic Concepts", "Module 3: Getting Started"],
  "Day 2": ["Module 1: Core Principles", "Module 2: Key Techniques", "Module 3: Problem Solving"],
  "Day 3": ["Module 1: Advanced Strategies", "Module 2: Complex Problems", "Module 3: Optimization"],
  "Day 4": ["Module 1: Real-world Applications", "Module 2: Case Studies", "Module 3: Industry Examples"],
  "Day 5": ["Module 1: Project Planning", "Module 2: Implementation", "Module 3: Review and Next Steps"],
  "ReferenceBooks": [
    {
      "title": "Essential Guide to ${courseTopic}",
      "author": "Expert Author",
      "source": "https://example.com/book1"
    },
    {
      "title": "Advanced ${courseTopic}",
      "author": "Another Expert",
      "source": "https://example.com/book2"
    }
  ],
  "YouTubeReferences": [
    {
      "title": "Introduction to ${courseTopic}",
      "url": "https://www.youtube.com/watch?v=example1"
    },
    {
      "title": "${courseTopic} Tutorial for Beginners",
      "url": "https://www.youtube.com/watch?v=example2"
    },
    {
      "title": "Advanced ${courseTopic} Techniques",
      "url": "https://www.youtube.com/watch?v=example3"
    }
  ]
}

Ensure that:
1. The course name is short and descriptive
2. The JSON structure is valid
3. Reference books have proper URLs
4. YouTube references contain actual, relevant educational videos (use real YouTube URLs if possible)
5. The course structure covers all necessary concepts`
}

export const JSON_PARSER = (input:string) => {
    return `I have a JSON object that might have syntax errors, such as missing commas, unmatched brackets, or other issues. Please validate the JSON and provide a corrected version if it's broken. !important only give JSON without any explation . mine JSON:${input}`
}


export const GENRATE_MODULE = (module: string, course: string) => {
    //     return `Generate comprehensive learning content specifically for the module "${module}" in the "${course}" course. Note that other modules in the course have already been defined. Focus exclusively on the topics outlined for "${module}" in the course structure. Provide detailed explanations, examples, and practical applications relevant to "${module}". Ensure the content is structured to cover the essential aspects of "${module}" without extending into other modules of the course. Format the content in html skiping head body , direct give content like "<h1>headnig</h1> <p>....</p>" and note important  things and heading should be bold and big in size , and dont nest span inside h1 and have text color #8678F9 and rest have white color and use tailwindcss to style and give jsx and heading tag size sholud be greater than normal text and it sholud contains more images and all the image source is working if , not surre about the working then give 2-3 images and sepration of topic done useing line   and there should be more amout of space between diffenr topics and it should not contains like  <h1><span>...</span> </h1> .
    // Present the content in a professional instructional style, akin to how a seasoned educator would deliver a lecture. Include thorough explanations with technical depth, illustrative examples, and practical scenarios that underscore the relevance of "Number Systems and Data Representation" in the context of "Computer Organization and Architecture". Structure the material with clear headings, subheadings, and a logical flow that aids comprehension. Aim for a blend of clarity, precision, and academic rigor to facilitate optimal learning outcomes.`
    return `Generate comprehensive learning content for the module "${module}" in the "${course}" course. Other modules in the course have already been defined, so focus exclusively on the topics outlined for "${module}" in the course structure. Provide detailed explanations, examples, and practical applications relevant to "${module}". Structure the content to cover the essential aspects of "${module}" without extending into other modules.
Format the content in HTML, skipping head and body tags. Directly provide content like:
<h1>Heading</h1>
<p>...</p>
Important points and headings should be bold and large in size.
Avoid nesting spans inside h1 tags.
Use text color #8678F9 for headings and white for the rest of the content.
Utilize TailwindCSS for styling and JSX for the code.
Ensure all heading tags are larger than normal text having #8678F9 colour.
Precede all second-level headings (main headings other than the module) with a horizontal bar <hr>.
Ensure there is one empty line before each heading inside the main headings.
Use proper indentation for bullet points or numbered lists.
Use the <b> tag for indicating bold text.
Present the content in a professional instructional style, similar to how a seasoned educator would deliver a lecture. Include thorough explanations with technical depth, illustrative examples, and practical scenarios that underscore the relevance of "${module}" in the context of "${course}". Structure the material with clear headings, subheadings, and a logical flow to aid comprehension. Aim for a blend of clarity, precision, and academic rigor to facilitate optimal learning outcomes.
Example Formatting:
<hr>
<h1>Main Heading</h1>
<p>...</p>

<br>
<hr style="border: 2px solid #8678F9; border-radius: 5px;">
<h2>Subheading</h2>
<h3>...</h3>
<p> ... </p>

<h3>...</h3>
<p> ... </p>

<br>
<hr style="border: 2px solid #8678F9; border-radius: 5px;">
<h2>Subheading</h2>
<h3>...</h3>
<p> ... </p><br>

<h3>...</h3>
<p> ... </p><br>

<ul>
  <br>
  <li>Indented bullet point</li>
  <br>
  <li><b>Bold text</b></li>
</ul>

<pre style="background-color: rgba(255, 255, 255, 0.1); color: #ffffff; padding: 1em; border-radius: 5px;">
    <code>
        // Sample code block
    </code>
</pre>
Ensure that the content adheres to these formatting guidelines to maintain a consistent and professional appearance.`
}
