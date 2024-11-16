let blogId = decodeURI(location.pathname.split("/").pop());

// Reference the blog document in Firestore
let docRef = db.collection("blogs").doc(blogId);

// Fetch blog data
docRef.get().then((doc) => {
    if (doc.exists) {
        setupBlog(doc.data());
    } else {
        // Redirect to home if the blog doesn't exist
        location.replace("/");
    }
}).catch((error) => {
    console.error("Error fetching document:", error);
    location.replace("/");
});

// Setup blog data into the UI
const setupBlog = (data) => {
    if (!data) return;

    // DOM elements
    const banner = document.querySelector('.banner');
    const blogTitle = document.querySelector('.title');
    const titleTag = document.querySelector('title');
    const publish = document.querySelector('.published');
    const article = document.querySelector('.article');

    // Set banner image
    if (data.bannerImage) {
        banner.style.backgroundImage = `url(${data.bannerImage})`;
    }

    // Set title
    if (data.title) {
        titleTag.innerHTML = data.title;
        blogTitle.innerHTML = data.title;
    } else {
        blogTitle.innerHTML = "Untitled Blog";
    }

    // Set published date
    if (data.publishedAt) {
        publish.innerHTML = `Published on: ${data.publishedAt}`;
    }

    // Populate article content
    if (data.article) {
        addArticle(article, data.article);
    } else {
        article.innerHTML = "<p>No content available for this blog.</p>";
    }
};

// Parse and add article content
const addArticle = (element, content) => {
    if (!content) return;

    // Split content into lines and filter non-empty ones
    const paragraphs = content.split("\n").filter(line => line.trim().length);

    paragraphs.forEach((line) => {
        // Check for heading (e.g., # Heading)
        if (line.startsWith("#")) {
            const headingLevel = line.match(/^#+/)[0].length; // Count '#' characters
            const headingText = line.slice(headingLevel).trim(); // Remove '#' and trim
            const tag = `h${Math.min(headingLevel, 6)}`; // Limit to h1-h6
            element.innerHTML += `<${tag}>${headingText}</${tag}>`;
        } 
        // Check for image format (e.g., ![alt](src))
        else if (line.startsWith("!") && line.includes("](")) {
            const altText = line.match(/!\[(.*?)\]/)?.[1] || "Image";
            const src = line.match(/\((.*?)\)/)?.[1] || "";
            element.innerHTML += `
                <img src="${src}" alt="${altText}" class="article-image">
            `;
        } 
        // Regular paragraph
        else {
            element.innerHTML += `<p>${line.trim()}</p>`;
        }
    });
};
