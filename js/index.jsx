import 'babel-polyfill';
import 'whatwg-fetch';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, applyRouterMiddleware } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { useScroll } from 'react-router-scroll';
import { bindActionCreators } from 'redux';
import { escapeRegExp } from 'lodash';

require( '../sass/style.scss' );
require( '../inc/bootstrap.scss' );

import Navigation from './components/navigation';
import Index from './components/posts';
import SinglePost from './components/post';
import SinglePage from './components/post/page';
import Term from './components/term';
import Attachment from './components/attachment';
import Search from './components/search';
import DateArchive from './components/date';
import Author from './components/author';
import NotFound from './components/not-found';
import { createReduxStore } from './state';
import { setMenu } from 'wordpress-query-menu/lib/state';
import { setPost, setPosts } from './utils/initial-actions';
import { keyboardFocusReset, skipLink, toggleFocus } from './utils/a11y';

const store = createReduxStore();
const history = syncHistoryWithStore( browserHistory, store );
const path = ReactVerseSettings.URL.path || '/';

function renderApp() 
{
	let blogURL, frontPageRoute;
	if ( ReactVerseSettings.frontPage.page ) 
	{
		blogURL = path + 'page/' + ReactVerseSettings.frontPage.blog + '/';
		frontPageRoute = <Route path={ path } slug={ ReactVerseSettings.frontPage.page } component={ SinglePage } />;
	} 
	else {
		blogURL = path;
		frontPageRoute = null;
	}

	const routerMiddleware = applyRouterMiddleware( useScroll( shouldUpdateScroll ), keyboardFocusReset( 'main' ) );
	const emitJetpackEvent = () => {
		jQuery( document.body ).trigger( 'post-load' );
	}

	const routes = (
		<Router history={ history } render={ routerMiddleware } onUpdate={ emitJetpackEvent }>
			<Route path={ blogURL } component={ Index } />
			<Route path={ `${ blogURL }p/:paged` } component={ Index } />
			{ frontPageRoute }
			<Route path={ `${ path }search/:search` } component={ Search } />
			<Route path={ `${ path }attachment/:id` } component={ Attachment } />
			<Route path={ `${ path }category/:slug` } taxonomy="category" component={ Term } />
			<Route path={ `${ path }category/:slug/p/:paged` } taxonomy="category" component={ Term } />
			<Route path={ `${ path }tag/:slug` } taxonomy="post_tag" component={ Term } />
			<Route path={ `${ path }tag/:slug/p/:paged` } taxonomy="post_tag" component={ Term } />
			<Route path={ `${ path }date/:year` } component={ DateArchive } />
			<Route path={ `${ path }date/:year/p/:paged` } component={ DateArchive } />
			{/*<Route path={ `${ path }date/:year/:month` } component={ DateArchive } />*/}
			<Route path={ `${ path }date/:year/:month/p/:paged` } component={ DateArchive } />
			<Route path={ `${ path }date/:year/:month/:day` } component={ DateArchive } />
			<Route path={ `${ path }date/:year/:month/:day/p/:paged` } component={ DateArchive } />
			<Route path={ `${ path }author/:slug` } component={ Author } />
			<Route path={ `${ path }author/:slug/p/:paged` } component={ Author } />
			<Route path={ `${ path }page/**` } component={ SinglePage } />
			<Route path={ `${ path }:year/:month/:slug` } component={ SinglePost } />
			<Route path="*" component={ NotFound } />
		</Router>
	);

	render(
		(
			<Provider store={ store }>
				{ routes }
			</Provider>
		),
		document.getElementById( 'main' )
	);

	if ( ReactVerseMenu.enabled ) 
	{
		render(
			(
				<Provider store={ store }>
					<Navigation />
				</Provider>
			),
			document.getElementById( 'site-navigation' )
		);
	} 
	else 
	{
		initNoApiMenuFocus();
	}
}

function shouldUpdateScroll( prevRouterProps, { location } ) {
	if ( location.hash ) {
		return false;
	}
	return true;
}

function initNoApiMenuFocus() {
	const container = document.getElementById( 'site-navigation' );
	if ( ! container ) {
		return;
	}

	const menu = container.getElementsByTagName( 'div' )[1];
	if ( ! menu ) {
		return;
	}

	const links = menu.getElementsByTagName( 'a' );
	let i, len;
	for ( i = 0, len = links.length; i < len; i++ ) {
		links[i].addEventListener( 'focus', toggleFocus, true );
		links[i].addEventListener( 'blur', toggleFocus, true );
	}

	const button = container.getElementsByTagName( 'button' )[0];
	button.onclick = function() {
		if ( -1 !== menu.className.indexOf( 'menu-open' ) ) {
			menu.className = menu.className.replace( ' menu-open', '' );
			menu.setAttribute( 'aria-expanded', 'false' );
			button.setAttribute( 'aria-expanded', 'false' );
		} else {
			menu.className += ' menu-open';
			menu.setAttribute( 'aria-expanded', 'true' );
			button.setAttribute( 'aria-expanded', 'true' );
		}
	};
}

function handleLinkClick() {
	let regexBaseUrl = ReactVerseSettings.URL.base;
	if ( '/' === regexBaseUrl[ regexBaseUrl.length - 1 ] ) {
		regexBaseUrl = regexBaseUrl.slice( 0, regexBaseUrl.length - 1 );
	}
	const escapedSiteURL = new RegExp( escapeRegExp( regexBaseUrl ).replace( /\//g, '\\\/' ) );

	jQuery( '#page' ).on( 'click', 'a[rel!=external][target!=_blank]', ( event ) => {
		if ( ! escapedSiteURL.test( event.currentTarget.href ) ) {
			return;
		}

		const linkRel = jQuery( event.currentTarget ).attr( 'rel' );
		if ( linkRel && linkRel.search( /attachment/ ) !== -1 ) {
			event.preventDefault();
			const result = jQuery( event.currentTarget ).attr( 'rel' ).match( /wp-att-(\d*)/ );
			const attachId = result[ 1 ];
			history.push( path + 'attachment/' + attachId );
			return;
		}

		if ( /wp-(admin|login)/.test( event.currentTarget.href ) || /\/feed\/$/.test( event.currentTarget.href ) ) {
			return;
		}
		event.preventDefault();
		let url = event.currentTarget.href;

		url = url.replace( ReactVerseSettings.URL.base, ReactVerseSettings.URL.path );
		history.push( url );
	} );

	jQuery( '#page' ).on( 'click', 'a[href^="#"]', ( event ) => {
		skipLink( event.target );
	} );
}

function renderPreloadData() {
	const actions = bindActionCreators( { setMenu, setPost, setPosts }, store.dispatch );
	actions.setMenu( 'primary', ReactVerseMenu.data );

	if ( ReactVerseData.data.length > 1 ) {
		actions.setPosts( ReactVerseData.data, ReactVerseData.paging );
	} else if ( ReactVerseData.data.length ) {
		const post = ReactVerseData.data[ 0 ];
		actions.setPost( post );
	}
}

document.addEventListener( 'DOMContentLoaded', function() {
	renderApp();
	renderPreloadData();
	handleLinkClick();
} );
