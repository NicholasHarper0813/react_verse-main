<?php 
class ReactVerse_SetPermalinks 
{
	public function __construct()
	{
		add_action( 'admin_notices', array( $this, 'admin_permalinks_warning' ) );
		add_action( 'init', array( $this, 'change_date' ) );
		add_action( 'init', array( $this, 'change_paged' ) );
		add_action( 'init', array( $this, 'change_page' ) );
		add_action( 'init', array( $this, 'add_new_attachment' ) );
		add_action( 'after_switch_theme', array( $this, 'update_permalinks' ), 11 );
		add_action( 'template_redirect', array( $this, 'do_redirects' ) );
		add_action( 'admin_head-options-permalink.php', array( $this, 'add_contextual_permalink_help' ) );
		add_action( 'after_switch_theme', 'flush_rewrite_rules' );
	}

	public function admin_permalinks_warning()
	{
		$current_screen = get_current_screen();
		if ( 'options-permalink' !== $current_screen->id ) 
		{
			return;
		}
		?>
		<div class="notice notice-warning">
			<p><?php _e( '<b>Warning:</b> The theme you\'re using does not support customized permalinks. See the Help tab above for more information.', 'reactverse' ); ?></p>
		</div>
		<?php
	}

	public function admin_theme_warning() 
	{
		?>
		<div class="notice notice-warning">
			<p><?php _e( 'This theme requires special URLs to display your content, so your permalinks have been updated. To undo this, switch to another theme.', 'reactverse' ); ?></p>
		</div>
		<?php
	}

	public function add_contextual_permalink_help() 
	{
		$screen = get_current_screen();

		$content = '<p>' . __( 'ReactVerse is a different kind of theme, which means it needs to handle URLs differently than other themes. There is no permalink customization in ReactVerse, you need to use the "Month and name" setting for posts.', 'reactverse' ) . '</p>';
		$content .= '<p>' . __( 'Other content on your site also needs different URLs, like the following:', 'reactverse' ) . '<ul>';
		$content .= '<li>' . __( 'Pages are now prefixed with <code>page</code>; for example, <code>%1$s/page/about/</code>', 'reactverse' ) . '</li>';
		$content .= '<li>' . __( 'Date archives are now prefixed with <code>date</code>; for example, <code>%1$s/date/2016/12/</code>', 'reactverse' ) . '</li>';
		$content .= '<li>' . __( 'Category and tag archives are prefixed with <code>category</code> and <code>tag</code>, which is core behavior, but this cannot be changed.', 'reactverse' ) . '</li>';
		$content .= '</ul></p>';

		$screen->add_help_tab( array(
			'id'      => 'reactverse_permalinks_help',
			'title'   => __( 'ReactVerse Permalinks', 'reactverse' ),
			'content' => sprintf( $content, untrailingslashit( site_url() ) ),
		) );
	}

	public function update_permalinks() 
	{
		global $wp_rewrite;
		$wp_rewrite->set_permalink_structure( '/%year%/%monthnum%/%postname%/' );
		add_action( 'admin_notices', array( $this, 'admin_theme_warning' ) );
	}

	public function change_date() 
	{
		global $wp_rewrite;
		$wp_rewrite->date_structure = '/date/%year%/%monthnum%/%day%';
	}

	public function change_paged() 
	{
		global $wp_rewrite;
		$wp_rewrite->pagination_base = 'p';
	}

	public function change_page() 
	{
		global $wp_rewrite;
		$wp_rewrite->page_structure = '/page/%pagename%';
	}

	public function add_new_attachment() 
	{
		add_rewrite_rule( '^attachment/([0-9]+)/?', 'index.php', 'top' );
	}

	public function do_redirects() 
	{
		$search = get_search_query();
		global $wp;
		if ( $search && ( 'search' !== substr( $wp->request, 0, 6 ) ) ) 
		{
			$search = html_entity_decode( $search, ENT_QUOTES );
			$url = home_url( sprintf( '/search/%s', urlencode( $search ) ) );
			wp_safe_redirect( $url );
			exit();
		} 
		elseif ( is_attachment() ) 
		{
			$attachment = get_queried_object_id();
			wp_safe_redirect( home_url( sprintf( '/attachment/%s', $attachment ) ) );
			exit();
		}
	}
}
new ReactVerse_SetPermalinks();
