import React, { Component } from 'react';
import Chart from '../components/detailsChart';
import { View, Text } from 'react-native';

export default class Results extends Component {
	render() {
		return (
			<View>
				<View style={{ marginTop: 40, marginBottom: 40, paddingHorizontal: 20 }}>
					<Text style={{ fontSize: 24, fontWeight: '700' }}>Token Distribution</Text>
					<Text style={{ fontWeight: '100', marginTop: 10 }}>
						This feature has not been implemented yet. It would require Redux
					</Text>
				</View>

				<Chart />
			</View>
		);
	}
}
