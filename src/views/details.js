import React, { Component } from 'react';
import { View, Alert } from 'react-native';

import {
	fetchTxs,
	formatValue,
	txsToOperations,
	getEtherBalance,
	getPrice,
	getTokenBalancesWithPrices
} from '../utils/ledgerUtils';
import Events from '../utils/events';
import { HeaderBackButton } from 'react-navigation';

import DetailsHeader from '../components/detailHeader';
import DetailsTokens from '../components/detailsTokens';
import DetailsOperations from '../components/detailsOperations';

export default class Details extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			headerTitleStyle: {
				fontSize: 12
			},
			title: navigation.getParam('address', 'Explorer'),
			headerLeft: (
				<HeaderBackButton
					onPress={() => {
						Events.publish('RefreshHistory');
					}}
				/>
			)
		};
	};
	state = {
		address: '',
		page: 0,
		balance: 0,
		balanceUSD: 0,
		ethprice: 0,
		tokens: [],
		operations: [],
		operationsGrouped: [],
		operationsAll: [],
		loading: null,
		refreshing: false
	};
	async componentDidMount() {
		const { navigation } = this.props;
		const address = navigation.getParam('address', 'NO-ADDRESS');
		this.setState({ loading: true });
		await this.initCalls(address);
	}
	async initBalance(address) {
		const getBalance = await getEtherBalance(address);
		const etherPrice = await getPrice('ETH', 'USD');
		this.setState({
			ethprice: etherPrice.USD,
			balance: this.formattedToken(getBalance.result, 18),
			balanceUSD: (this.formattedToken(getBalance.result, 18) * etherPrice.USD).toFixed(2)
		});
	}

	async initOperations(address) {
		try {
			const transactions = await fetchTxs(address, 5000);
			const operationsObject = await txsToOperations(transactions, address);
			const operationsFetched = operationsObject.groups;
			const operationsAll = operationsObject.total;

			this.setState({
				operations: operationsFetched.length > 0 ? operationsFetched[this.state.page] : [],
				operationsGrouped: operationsFetched,
				operationsAll: operationsAll,
				refreshing: false
			});
		} catch (err) {
			this.showNetworkAlert();
		}
	}

	async initTokensWithBalances() {
		const getTokensWithBalances = await getTokenBalancesWithPrices(this.state.operationsAll, 'USD');
		this.setState({
			tokens: Object.values(getTokensWithBalances).sort((a, b) => b.total_usd - a.total_usd)
		});
	}

	formattedToken(value, magnitude) {
		return `${formatValue(value, magnitude)}`;
	}

	async initCalls(address) {
		try {
			await this.initBalance(address);
			const operations = await this.initOperations(address);
			this.setState({ showTheLoadMoreButton: true });
			await this.initTokensWithBalances(operations);
		} catch (err) {
			console.log('Error', err);
		}
	}
	showNetworkAlert() {
		Alert.alert(
			'Network Error',
			'Please check your internet connection',
			[ { text: 'Ok', onPress: () => console.log('pressed') } ],
			{ cancelable: false }
		);
	}

	_handleLoadMore = () => {
		if (this.state.page < this.state.operationsGrouped.length - 1) {
			this.setState(
				(prevState, nextProps) => ({
					page: prevState.page + 1
				}),
				() => {
					this.setState({
						operations: this.state.operations.concat(this.state.operationsGrouped[this.state.page])
					});
				}
			);
		} else {
			this.setState({ showTheLoadMoreButton: false });
		}
	};
	_handleRefresh = () => {
		this.setState(
			{
				page: 0,
				refreshing: true
			},
			async () => {
				this.initOperations(this.state.address);
			}
		);
	};
	render() {
		return (
			<View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
				<DetailsHeader
					balance={this.state.balance}
					balanceUSD={this.state.balanceUSD}
					ethprice={this.state.ethprice}
				/>
				<DetailsTokens tokens={this.state.tokens} />
				<DetailsOperations
					ethprice={this.state.ethprice}
					operations={this.state.operations}
					operationsAll={this.state.operationsAll}
					operationsGrouped={this.state.operationsGrouped}
					handleRefresh={this._handleRefresh}
					handleMore={this._handleLoadMore}
					refreshing={this.state.refreshing}
					showTheLoadMoreButton={this.state.showTheLoadMoreButton}
					tokens={this.state.tokens}
				/>
			</View>
		);
	}
}
