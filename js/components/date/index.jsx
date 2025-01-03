import React from 'react';
import { isRequestingPostsForQuery, getPostsForQuery, getTotalPagesForQuery } from 'wordpress-query-posts/lib/selectors';
import { connect } from 'react-redux';
import DocumentMeta from 'react-document-meta';
import BodyClass from 'react-body-class';
import moment from 'moment';
import he from 'he';
import QueryPosts from 'wordpress-query-posts';
import PostList from '../posts/list';
import Pagination from '../pagination/archive';
import Placeholder from '../placeholder';

const DateArchive = React.createClass( {
	render() 
	{
		const { query, loading, path, page, totalPages, dateString, posts } = this.props;
		const meta = 
		{
			title: dateString + ' – ' + he.decode( ReactVerseSettings.meta.title ),
		};

		return (
			<div className="card">
				<DocumentMeta { ...meta } />
				<BodyClass classes={ [ 'archive', 'date' ] } />
				<header className="page-header">
					<h1 className="page-title">Archive for { dateString }</h1>
				</header>
				<QueryPosts query={ query } />
				{ loading ?
					<Placeholder type="date" /> :
					<PostList posts={ posts } />
				}

				<Pagination
					path={ path }
					current={ page }
					isFirstPage={ 1 === page }
					isLastPage={ totalPages === page } />
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	let path = ReactVerseSettings.URL.path || '/';
	path += 'date/';
	[ 'year', 'month', 'day' ].map( ( key ) => {
		if ( ownProps.params.hasOwnProperty( key ) ) {
			path += ownProps.params[ key ] + '/';
		}
	} );

	const { day, month, year } = ownProps.params;
	let date, dateString, query = {};
	query.page = ownProps.params.paged || 1;
	if ( day ) 
	{
		date = moment( `${ year } ${ month } ${ day }`, 'YYYY MM DD' );
		dateString = date.format( 'MMMM Do YYYY' );
		query.after = date.format();
		query.before = date.add( 1, 'day' ).format();
	} 
	else if ( month ) 
	{
		date = moment( `${ year } ${ month }`, 'YYYY MM' );
		dateString = date.format( 'MMMM YYYY' );
		query.after = date.format();
		query.before = date.add( 1, 'month' ).format();
	} 
	else 
	{
		date = moment( `${ year }`, 'YYYY' );
		dateString = date.format( 'YYYY' );
		query.after = date.format();
		query.before = date.add( 1, 'year' ).format();
	}

	query.after = encodeURIComponent( query.after );
	query.before = encodeURIComponent( query.before );

	const posts = getPostsForQuery( state, query ) || [];
	const requesting = isRequestingPostsForQuery( state, query );

	return 
	{
		path,
		query,
		posts,
		requesting,
		dateString,
		loading: requesting && ! posts.length,
		page: parseInt( query.page ),
		totalPages: getTotalPagesForQuery( state, query ),
	};
} )( DateArchive );
