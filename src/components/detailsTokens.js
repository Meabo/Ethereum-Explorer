import React from 'react';
import { Text, View, FlatList } from 'react-native';
import { Content, Body, Card, CardItem, Spinner } from 'native-base';

const DetailsTokens = ({ tokens }) => (
	<View style={{ flex: 2, marginTop: 10 }}>
		<Text style={{ marginLeft: 20 }}>Tokens ({tokens.length > 0 ? tokens.length : 0})</Text>
		{!tokens ? (
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
			<Content>
				<FlatList
					style={{}}
					data={tokens}
					horizontal={true}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<Card>
							<CardItem>
								<Body>
									<Text style={{ fontSize: 13, fontWeight: '500' }}>
										{item.symbol} {item.balance}
									</Text>
									<Text style={{ fontSize: 12 }}>${item.total_usd}</Text>
								</Body>
							</CardItem>
						</Card>
					)}
					keyExtractor={(item) => item.symbol}
				/>
			</Content>
		)}
	</View>
);

export default DetailsTokens;
