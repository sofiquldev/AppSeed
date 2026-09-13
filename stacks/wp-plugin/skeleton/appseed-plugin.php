<?php
/**
 * Plugin Name: AppSeed Plugin
 * Description: {{APPSEED_TAGLINE}}. A small starter plugin.
 * Version: 1.0.0
 * Author: AppSeed
 * Text Domain: appseed
 */

if (! defined('ABSPATH')) {
    exit;
}

function appseed_plugin_menu()
{
    add_menu_page(
        'AppSeed',
        'AppSeed',
        'manage_options',
        'appseed-plugin',
        'appseed_plugin_page',
        'dashicons-admin-generic',
        58
    );
}

add_action('admin_menu', 'appseed_plugin_menu');

function appseed_plugin_assets($hook)
{
    if ($hook !== 'toplevel_page_appseed-plugin') {
        return;
    }
    wp_enqueue_style('appseed-plugin', plugin_dir_url(__FILE__).'assets/app.css', [], '1.0.0');
}

add_action('admin_enqueue_scripts', 'appseed_plugin_assets');

function appseed_plugin_page()
{
    echo '<div class="wrap appseed-wrap"><h1>AppSeed plugin</h1><p>Starter admin screen. Replace this with the settings you actually need.</p></div>';
}
