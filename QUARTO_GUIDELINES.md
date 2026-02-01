# Quarto/Jupyter Blog Post Guidelines

This document outlines the workflow for creating and deploying blog posts using Jupyter Notebooks and Quarto.

This workflow uses a Jekyll Collection (`_blogs`) to generate a dynamic list of blog posts on the `/blogs` page. The actual content is rendered from Jupyter Notebooks (`.ipynb`) into standalone HTML files that live in the `blog_assets` directory. A custom navigation header is injected during the render process to allow users to navigate back to the main site.

## Workflow

1.  **Create Your Jupyter Notebook:**
    *   Create your new Jupyter Notebook (`.ipynb`) file.
    *   Place the notebook inside the `blog_assets/` directory, organized by year and month. For example: `blog_assets/2026/02/my-new-post.ipynb`.

2.  **Render All Notebooks to HTML:**
    *   Open your terminal in the root directory of this project.
    *   Run the batch file:
        ```bash
        render_blogs.bat
        ```
    *   This script will automatically find and render every `.ipynb` file within the `blog_assets` directory. It will create the corresponding `.html` file (and `_files` folder, if needed) in the same location as the source notebook.

3.  **Create a Pointer File in `_blogs`:**
    *   Create a new Markdown file in the `_blogs` directory, named with the date and a slug (e.g., `_blogs/2026-02-15-my-new-post.md`).
    *   This file only needs YAML front matter. This metadata will be used to create the "card" on the `/blogs` page.
    *   The `link:` key is crucial: it must point to the path of the rendered HTML file from the previous step.

        ```yaml
        ---
        title: "My New Blog Post Title"
        date: 2026-02-15
        excerpt: "A short, one-sentence teaser for your blog post that will appear on the card."
        link: /blog_assets/2026/02/my-new-post.html
        ---
        ```

4.  **Check Your Work:**
    *   Restart your local Jekyll server to ensure it picks up the new file in the `_blogs` collection.
    *   Navigate to your `/blogs` page. You should see a new card for your post. Clicking it should take you to your rendered HTML page, which will have the site's navigation bar at the top.

## Updating the Navigation Bar

The navigation bar in the rendered blog posts is a snapshot of the main site's navigation. If you ever update the main site's navigation (in `_data/navigation.yml`), you will need to manually update the `_includes/blog_nav_header.html` file to reflect these changes. This can be done by copying the rendered HTML of the new navbar into that file.
