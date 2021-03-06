'use strict';

const extend = require('node.extend');
const pkg = require('../package.json');
require('isomorphic-fetch');

module.exports = class ChangeRequestClient {

	constructor(options) {
		options = extend(true, {
			host: 'cr-api.in.ft.com'
		}, options);
		this.apiKey = options.apiKey;
		this.host = options.host;
		this.userAgent = `ft-change-request/${pkg.version}`;
	}

	fetch(endpoint, options) {
		const url = `https://${this.host}${endpoint}`;
		options = extend(true, {
			headers: {
				'X-Api-Key': this.apiKey,
				'User-Agent': this.userAgent
			}
		}, options);
		let fetchResponse;
		return fetch(url, options)
			.then(response => {
				fetchResponse = response;
				return response.json();
			})
			.then(body => {
				if (!fetchResponse.ok) {
					let errorMessage = `${endpoint} responded with a ${fetchResponse.status} status`;
					if (body && body.error) {
						errorMessage += `\n${body.error}`;
					}
					throw new Error(errorMessage);
				}
				return {
					response: fetchResponse,
					body: body
				};
			});
	}

	get(endpoint, options) {
		options = extend(true, {
			method: 'GET'
		}, options);
		return this.fetch(endpoint, options);
	}

	post(endpoint, data, options) {
		options = extend(true, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json'
			}
		}, options);
		return this.fetch(endpoint, options);
	}

	open(data) {
		data = extend(true, {
			changeCategory: 'Minor',
			environment: 'Test',
			notify: false,
			reasonForChangeDetails: 'Deployment',
			riskProfile: 'Low',
			willThereBeAnOutage: 'No'
		}, data);
		return this.post('/v2/releaselog', data);
	}

	close(data) {
		data = extend(true, {
			closeCategory: 'Implemented',
			notify: false
		}, data);
		return this.post('/v2/close', data);
	}

};
