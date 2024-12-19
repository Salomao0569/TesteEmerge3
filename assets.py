from flask_assets import Environment, Bundle
from flask import Flask

def init_assets(app: Flask):
    assets = Environment(app)
    assets.url = app.static_url_path

    # CSS Bundle
    css = Bundle(
        'css/styles.css',
        filters='cssmin',
        output='gen/packed.css'
    )
    assets.register('css_all', css)

    # JavaScript Bundle
    js = Bundle(
        'js/editor.js',
        'js/calculations.js',
        'js/form_utils.js',
        'js/pdf_generator.js',
        'js/doctors.js',
        'js/doc_generator.js',
        'js/csrf_utils.js',
        'js/form_validation.js',
        filters='jsmin',
        output='gen/packed.js'
    )
    assets.register('js_all', js)

    # Ensure output directory exists
    import os
    os.makedirs(os.path.join(app.static_folder, 'gen'), exist_ok=True)

    return assets