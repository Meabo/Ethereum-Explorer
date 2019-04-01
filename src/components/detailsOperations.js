import React, { Component } from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import { Content, ListItem, Icon, Right, Left, Body, Button, Spinner } from 'native-base';
import { formatValue } from '../utils/ledgerUtils';
import TimeAgo from 'react-native-timeago';

class DetailsOperations extends Component {
	drawArrow(type) {
		{
			if (type === 'IN') {
				return <Icon type="FontAwesome" name="arrow-down" style={{ color: 'green' }} />;
			}
			return <Icon type="FontAwesome" name="arrow-up" style={{ color: 'red' }} />;
		}
	}

	formattedToken(value, magnitude) {
		return `${formatValue(value, magnitude)}`;
	}

	getTokenPrice(symbol) {
		if (symbol === 'ETH') {
			return this.props.ethprice;
		}
		const token = Object.values(this.props.tokens).find((e) => e.symbol === symbol);
		return token.unit_price;
	}

	printPrice(item) {
		if (item.symbol === 'ETH') {
			return (
				<Text note>
					{item.type === 'IN' ? '+' : '-'}{' '}
					{this.formattedToken(item.value, item.magnitude) * this.props.ethprice}$
				</Text>
			);
		} else {
			if (this.props.tokens.length > 0) {
				return (
					<Text note>
						{item.type === 'IN' ? '+' : '-'}{' '}
						{this.formattedToken(item.value, item.magnitude) * this.getTokenPrice(item.symbol)}$
					</Text>
				);
			} else {
				return <Text note />;
			}
		}
	}

	render() {
		return (
			<View style={{ flex: 7 }}>
				<Text style={{ marginLeft: 20, marginBottom: 20 }}>
					Operations ({this.props.operations.length > 0 ? this.props.operations.length : 0}) - Total
					Operations ({this.props.operationsAll.length > 0 ? this.props.operationsAll.length : 0})
				</Text>

				{this.props.operations.length === 0 ? (
					<View
						style={{
							flex: 1,
							textAlign: 'center',
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Spinner color="blue" />
					</View>
				) : (
					<Content style={{ backgroundColor: '#fff' }}>
						<FlatList
							data={this.props.operations}
							showsVerticalScrollIndicator={false}
							renderItem={({ item }) => (
								<ListItem avatar>
									<Left>{this.drawArrow(item.type)}</Left>
									<Body>
										<Text style={{ fontSize: 16, fontWeight: '500' }}>
											{item.type === 'IN' ? '+' : '-'}{' '}
											{this.formattedToken(item.value, item.magnitude)} {item.symbol}
										</Text>
										{this.printPrice(item)}
									</Body>
									<Right>
										<Text note>
											<TimeAgo time={item.date} />
										</Text>
									</Right>
								</ListItem>
							)}
							refreshing={this.props.refreshing}
							onRefresh={this.props.handleRefresh}
							onEndReachedThreshold={0}
							initialNumToRender={20}
							ItemSeparatorComponent={() => <View style={styles.separator} />}
							keyExtractor={(item) => item.id}
						/>
					</Content>
				)}

				<View>
					{this.props.operations.length > 0 && this.props.showTheLoadMoreButton === true ? (
						<Button block onPress={this.props.handleMore}>
							<Text style={{ color: 'white' }}>Next 20 operations</Text>
						</Button>
					) : (
						<View />
					)}
				</View>
			</View>
		);
	}
}
const styles = StyleSheet.create({
	separator: {
		height: 0.5,
		backgroundColor: 'rgba(0,0,0,0.2)'
	}
});

export default DetailsOperations;
