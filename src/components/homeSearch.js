import React, { PureComponent } from 'react';
import { View, Button, TextInput, Alert, Platform, AsyncStorage } from 'react-native';
import { Subject } from 'rxjs';
import { isValidEthereum } from '../utils/ledgerUtils';

const inputStream = new Subject();
import { Text, Icon } from 'native-base';
export default class HomeSearch extends PureComponent {
	state = {
		searchText: ''
	};
	showAlert() {
		Alert.alert(
			'Your ETH address is wrong',
			'Your address should begin with a 0x #SAFU',
			[ { text: 'Ok', onPress: () => console.log('pressed') } ],
			{ cancelable: false }
		);
	}
	initializeInputStream() {
		inputStream.subscribe((val) => {
			this.setState({
				searchText: val.value
			});
		});
	}
	componentWillUnmount() {
		inputStream.unsubscribe();
	}
	componentDidMount() {
		this.initializeInputStream();
	}

	async navigateToDetails() {
		if (this.state.searchText && isValidEthereum(this.state.searchText)) {
			const res = await this.storeData(this.state.searchText);
			this.props.navigation.navigate('Details', {
				address: this.state.searchText
			});
		} else {
			this.showAlert();
		}
	}

	async storeData(address) {
		try {
			const value = await AsyncStorage.getItem(address);
			if (!value) {
				await AsyncStorage.setItem(address, address);
				return address;
			}
		} catch (error) {
			console.log('Error', error);
		}
	}

	render() {
		return (
			<View>
				<View style={{ marginTop: 40, paddingHorizontal: 20 }}>
					<Text style={{ fontSize: 24, fontWeight: '700' }}>Introducing Ledger Explorer</Text>
					<Text style={{ fontWeight: '100', marginTop: 10 }}>A new Ethereum explorer built for mobile</Text>
				</View>
				<View
					style={{
						flexDirection: 'row',
						padding: 10,
						backgroundColor: 'white',
						marginHorizontal: 20,
						shadowOffset: { width: 0, height: 0 },
						shadowColor: 'black',
						shadowOpacity: 0.2,
						elevation: 1,
						marginTop: Platform.OS == 'android' ? 30 : null
					}}
				>
					<Icon name="ios-search" size={15} style={{ marginRight: 10 }} />
					<TextInput
						underlineColorAndroid="transparent"
						placeholder="Try 0x..."
						editable={true}
						placeholderTextColor="grey"
						style={{ flex: 1, fontWeight: '700', backgroundColor: 'white' }}
						onChangeText={(searchText) => inputStream.next({ value: searchText })}
					/>
					<Button
						style={{ width: 200 }}
						title="Search"
						onPress={() => {
							this.navigateToDetails();
						}}
					/>
				</View>
			</View>
		);
	}
}
