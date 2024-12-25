<?php 
class ReactVerse_LoadData 
{
	public function __construct() 
	{
		add_action( 'pre_get_posts', array( $this, 'unstick_stickies' ) );
		add_filter( 'wp_enqueue_scripts', array( $this, 'print_data' ) );
	}

	public function unstick_stickies( $query ) 
	{
		$query->set( 'ignore_sticky_posts', true );
		$query->set( 'posts_per_page', 10 );
	}

	public function print_data() 
	{
		$menu_data = sprintf(
			'var ReactVerseData = %s;',
			$this->add_json_data()
		);
		wp_add_inline_script( REACTVERSE_APP, $menu_data, 'before' );
	}

	public function add_json_data() 
	{
		return wp_json_encode( array(
			'data' => $this->get_post_data(),
			'paging' => $this->get_total_pages(),
		) );
	}

	public function get_post_data() 
	{
		if ( ! ( ( is_home() && ! is_paged() ) || is_page() || is_singular() ) ) 
		{
			return array();
		}

		$posts = $GLOBALS['wp_query']->posts;
		$rest_server        = rest_get_server();
		$data               = array();
		$request            = new \WP_REST_Request();
		$request['context'] = 'view';

		foreach ( (array) $posts as $post ) 
		{
			$controller = new \WP_REST_Posts_Controller( $post->post_type );
			$data[]     = $rest_server->response_to_data( $controller->prepare_item_for_response( $post, $request ), true );
		}

		return $data;
	}

	public function get_total_pages() 
	{
		if ( is_404() ) 
		{
			return 0;
		}

		return intval( $GLOBALS['wp_query']->max_num_pages );
	}
}
new ReactVerse_LoadData();
