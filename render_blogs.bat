@echo off
echo ======================================================
echo  Rendering all Jupyter Notebooks in /blog_assets/
echo ======================================================

for /r blog_assets %%f in (*.ipynb) do (
    echo ---
    echo Rendering: %%f
    quarto render "%%f" --to html
)

echo.
echo ======================================================
echo  All blog posts rendered successfully.
echo ======================================================
