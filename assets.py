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
        filters='jsmin',
        output='gen/packed.js'
    )
    assets.register('js_all', js)
    
    return assets
