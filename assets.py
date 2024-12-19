from flask_assets import Environment, Bundle
from flask import Flask
import os

def init_assets(app: Flask):
    assets = Environment(app)
    assets.url = app.static_url_path

    # Ensure static folders exist
    for folder in ['css', 'js', 'gen']:
        folder_path = os.path.join(app.static_folder, folder)
        os.makedirs(folder_path, exist_ok=True)

    # CSS Bundle
    css = Bundle(
        'css/styles.css',
        filters='cssmin',
        output='gen/packed.css'
    )
    assets.register('css_all', css)

    # JavaScript Bundle
    js = Bundle(
        'js/calculations.js',
        'js/csrf_utils.js',
        'js/doc_generator.js',
        'js/doctors.js',
        'js/editor.js',
        'js/form_utils.js',
        'js/form_validation.js',
        'js/pdf_generator.js',
        filters='jsmin',
        output='gen/packed.js'
    )
    assets.register('js_all', js)

    try:
        # Build all bundles
        for bundle in assets:
            bundle.build()
    except Exception as e:
        app.logger.error(f"Error building assets: {e}")

    return assets