import React, { Component } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Icon } from 'native-base';
import { createBottomTabNavigator, createAppContainer } from 'react-navigation';
import Details from './details';
import Results from './results';

const BottomTabNavigator = createBottomTabNavigator(
	{
		Details: {
			screen: Details,
			navigationOptions: {
				tabBarLabel: 'Explorer',
				tabBarIcon: ({ tintColor }) => (
					<Icon type="AntDesign" name="smileo" style={{ fontSize: 20, color: tintColor }} />
				)
			}
		},
		Results: {
			screen: Results,
			navigationOptions: {
				tabBarLabel: 'Analytics',
				tabBarIcon: ({ tintColor }) => (
					<Icon type="AntDesign" name="meh" style={{ fontSize: 20, color: tintColor }} />
				)
			}
		}
	},
	{
		tabBarOptions: {
			activeTintColor: 'red',
			inactiveTintColor: 'grey',
			style: {
				backgroundColor: 'white',
				borderTopWidth: 0,
				shadowOffset: { width: 5, height: 3 },
				shadowColor: 'black',
				shadowOpacity: 0.5,
				elevation: 5
			}
		}
	}
);

export default createAppContainer(BottomTabNavigator);
