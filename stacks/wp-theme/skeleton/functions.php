<?php

function appseed_setup()
{
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
}

add_action('after_setup_theme', 'appseed_setup');

function appseed_assets()
{
    wp_enqueue_style('appseed-tokens', get_template_directory_uri().'/assets/tokens.css', [], '1.0.0');
    wp_enqueue_style('appseed', get_template_directory_uri().'/assets/app.css', ['appseed-tokens'], '1.0.0');
}

add_action('wp_enqueue_scripts', 'appseed_assets');
