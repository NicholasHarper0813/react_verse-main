import React from 'react';
import { connect } from 'react-redux';
import { isRequestingCommentsForPost, getCommentsForPost, getTotalCommentsForPost } from 'wordpress-query-comments/lib/selectors';
import BodyClass from 'react-body-class';
import QueryComments from 'wordpress-query-comments';
import Comment from './single';
import CommentForm from './form';
import Placeholder from '../placeholder';

const Comments = React.createClass( {
	renderForm() 
	{
		return (
			<div className="comment-respond">
				<h2 className="comment-reply-title">Leave a Reply</h2>

				<CommentForm postId={ this.props.postId } />
			</div>
		);
	},

	render() 
	{
		if ( this.props.protected ) 
		{
			return null;
		}
		const comments = this.props.comments;
		let commentsList = null;
		if ( comments && comments.length ) 
		{
			commentsList = comments.map( function( item, i ) {
				return <Comment key={ i } comment={ item } />
			} );
		}

		if ( ! commentsList ) 
		{
			commentsList = (
				<h2 className="screen-reader-text comments-title">No comments on &ldquo;{ this.props.title }&rdquo;</h2>
			);
		}

		let titleString = 'One comment on ';
		if ( this.props.total > 1 ) 
		{
			titleString = `${ this.props.total } comments on `;
		}

		return (
			<div className="comments-area" ref="comments" aria-live="polite">
				<QueryComments postId={ this.props.postId } />
				<BodyClass classes={ { 'has-comments': !! this.props.total } } />
				{ ( 0 === this.props.total ) ?
					null :
					<h2 className="comments-title">{ titleString }&ldquo;{ this.props.title }&rdquo;</h2>
				}

				<ol className="comment-list">
					{ this.props.loading ?
						<Placeholder type="comments" /> :
						commentsList
					}
				</ol>

				{ ! this.props.loading && this.props.commentsOpen && this.renderForm() }
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	const postId = ownProps.postId;
	const comments = getCommentsForPost( state, postId );
	const requesting = isRequestingCommentsForPost( state, postId );

	return 
	{
		postId,
		comments,
		requesting,
		loading: requesting && ! comments,
		total: getTotalCommentsForPost( state, postId ),
	};
} )( Comments );
