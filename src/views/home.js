import React, { Component } from 'react';
import { View } from 'react-native';

import HomeSearch from '../components/homeSearch';
import HomeHistory from '../components/homeHistory';

export default class Home extends Component {
	render() {
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: 'white'
				}}
			>
				<HomeSearch navigation={this.props.navigation} />
				<HomeHistory navigation={this.props.navigation} />
			</View>
		);
	}
}
