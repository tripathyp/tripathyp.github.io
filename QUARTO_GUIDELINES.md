# Quarto Blog Post Guidelines

This document outlines the workflow for creating and deploying blog posts using Quarto for this website. This method generates standalone HTML files, which are then manually linked from the main `blogs.html` page.

## Workflow

1.  **Create your Quarto Source File (.qmd):**
    *   Place your Quarto source `.qmd` files in the `quarto_src/` directory.
    *   Ensure your `.qmd` file is structured with the necessary YAML front matter and includes your Python code blocks for plots, tables, or other dynamic content. For example:
        ```yaml
        ---
        title: "Your Post Title"
        author: "Your Name"
        date: "YYYY-MM-DD"
        format:
          html:
            code-fold: true
            theme: cosmo
        jupyter: python3 # Or your preferred Python kernel (e.g., defor39, autofloods)
        ---
        ```

2.  **Render the Quarto Document to HTML:**
    *   Open your terminal in the root directory of this project.
    *   Run the following command to render your `.qmd` file to a standalone HTML output. Replace `your-post.qmd` with the actual filename of your Quarto source file.
        ```bash
        quarto render quarto_src/your-post.qmd --to html
        ```
    *   This command will generate `your-post.html` and a corresponding `your-post_files/` directory (if it contains assets like images) directly within the `quarto_src/` directory.

3.  **Move the Generated Output to the `blogs/` Folder:**
    *   Once rendering is complete, move the generated HTML file and its associated `_files` directory to the top-level `blogs/` directory. **It is crucial NOT to rename these files/folders.**
    *   If you're updating an existing post, you may need to force the move to overwrite old files/folders.
        ```bash
        move -Force quarto_src/your-post.html blogs/your-post.html
        move -Force quarto_src/your-post_files blogs/your-post_files
        ```
        (Note: If your `.qmd` did not generate a `_files` directory, you only need to move the HTML file.)

4.  **Update `blogs.html` (Manually):**
    *   Edit your static `blogs.html` file (the main blog listing page).
    *   Manually add a link to your new blog post:
        ```html
        <a href="blogs/your-post.html">Your Post Title</a>
        ```
    *   Ensure to follow the existing formatting and style of your `blogs.html` page.

Following these steps will ensure your Quarto-generated blog posts are correctly integrated into your website.
