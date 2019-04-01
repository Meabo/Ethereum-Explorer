import React from 'react';
import { Text, View } from 'react-native';
import { Spinner } from 'native-base';

const DetailsHeader = ({ balance, balanceUSD, ethprice }) => (
	<View
		style={{
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			marginTop: 10
		}}
	>
		{balance >= 0 && balanceUSD >= 0 ? (
			<View>
				<Text style={{ fontSize: 24, fontWeight: '700' }}>ETH {balance}</Text>
				<Text style={{ fontSize: 18, fontWeight: '300' }}>
					USD {balanceUSD} (@{ethprice}USD)
				</Text>
			</View>
		) : (
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
		)}
	</View>
);

export default DetailsHeader;
