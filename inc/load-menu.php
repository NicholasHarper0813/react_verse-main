<?php 
class ReactVerse_LoadMenu 
{
	public function __construct() 
	{
		add_filter( 'wp_enqueue_scripts', array( $this, 'print_data' ) );
	}

	public function print_data() 
	{
		$menu_data = sprintf(
			'var ReactVerseMenu = %s;',
			$this->add_json_data()
		);
		wp_add_inline_script( REACTVERSE_APP, $menu_data, 'before' );
	}

	public function add_json_data() 
	{
		return wp_json_encode( array(
			'enabled' => class_exists( 'WP_REST_Menus' ),
			'data' => $this->get_menu_data(),
		) );
	}

	public function get_menu_data() 
	{
		$menu = array();
		$request = new \WP_REST_Request();
		$request['context'] = 'view';
		$request['location'] = 'primary';

		if ( class_exists( 'WP_REST_Menus' ) ) 
		{
			$menu_api = new WP_REST_Menus();
			$menu = $menu_api->get_menu_location( $request );
		}

		return $menu;
	}
}
new ReactVerse_LoadMenu();
