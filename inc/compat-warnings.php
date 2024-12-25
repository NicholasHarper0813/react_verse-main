<?php 
function reactverse_switch_theme() 
{
	switch_theme( WP_DEFAULT_THEME );
	unset( $_GET['activated'] );
	add_action( 'admin_notices', 'reactverse_upgrade_notice' );
}
add_action( 'after_switch_theme', 'reactverse_switch_theme' );

function reactverse_upgrade_notice() 
{
	$message = __( 'ReactVerseReactVerse requires WordPress 4.7 or higher. Please update your site and try again.', 'reactverse' );
	printf( '<div class="error"><p>%s</p></div>', $message ); /* WPCS: xss ok. */
}

function reactverse_customize() 
{
	wp_die( __( 'ReactVerse requires WordPress 4.7 or higher. Please update your site and try again.', 'reactverse' ), '', array(
		'back_link' => true,
	) );
}
add_action( 'load-customize.php', 'reactverse_customize' );

function reactverse_preview() 
{
	if ( isset( $_GET['preview'] ) ) 
	{
		wp_die( __( 'ReactVerse requires WordPress 4.7 or higher. Please update your site and try again.', 'reactverse' ) );
	}
}
add_action( 'template_redirect', 'reactverse_preview' );
