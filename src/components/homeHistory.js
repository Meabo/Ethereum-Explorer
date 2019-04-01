import React, { PureComponent } from 'react';
import { View, FlatList, AsyncStorage, TouchableHighlight } from 'react-native';
import Events from '../utils/events';
import { Text, Body, ListItem } from 'native-base';
export default class HomeHistory extends PureComponent {
	state = {
		history: []
	};

	componentDidMount() {
		this.getHistory();
		this.refreshEvent = Events.subscribe('RefreshHistory', () => this.getHistory);
	}
	componentWillUnmount() {
		this.refreshEvent.remove();
	}

	goToDetails(address) {
		this.props.navigation.navigate('Details', {
			address: address
		});
	}
	getHistory() {
		const history = [];
		AsyncStorage.getAllKeys((err, keys) => {
			AsyncStorage.multiGet(keys, (err, stores) => {
				stores.map((result, i, store) => {
					let value = store[i][1];
					history.push(value);
				});
				console.log(history);
				this.setState({ history });
			});
		});
	}

	render() {
		return (
			<View>
				<View style={{ marginTop: 40, paddingHorizontal: 20 }}>
					<Text style={{ fontSize: 24, fontWeight: '700' }}>History</Text>
				</View>
				<View>
					{console.log(this.state.history)}
					{this.state.history.length > 0 ? (
						<FlatList
							data={this.state.history}
							showsVerticalScrollIndicator={false}
							renderItem={({ item }) => (
								<ListItem>
									<Body>
										<TouchableHighlight onPress={() => this.goToDetails(item)}>
											<Text style={{ fontSize: 12, fontWeight: '300' }}>{item}</Text>
										</TouchableHighlight>
									</Body>
								</ListItem>
							)}
							keyExtractor={(item) => item}
						/>
					) : (
						<Text />
					)}
				</View>
			</View>
		);
	}
}
