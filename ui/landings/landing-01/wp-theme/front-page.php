<?php get_header(); ?>
<main>
    <section class="hero">
        <p class="eyebrow">Landing 01</p>
        <h1><?php bloginfo('name'); ?></h1>
        <p class="lede">A WordPress starter theme. Change tokens, not twenty templates.</p>
        <div class="actions">
            <a class="btn" href="#contact">Get started</a>
        </div>
    </section>
    <section class="features">
        <article>
            <h3>Theme, not a plugin</h3>
            <p>Activate it under Appearance → Themes.</p>
        </article>
        <article>
            <h3>Tokens</h3>
            <p>Colors live in assets/tokens.css.</p>
        </article>
        <article>
            <h3>Docker</h3>
            <p><code>docker compose up</code> then install WordPress in the browser.</p>
        </article>
    </section>
</main>
<?php get_footer(); ?>
