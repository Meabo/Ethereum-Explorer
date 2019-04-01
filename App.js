import { createStackNavigator, createAppContainer } from 'react-navigation';
import Home from './src/views/home';
import DetailsContainer from './src/views/detailsContainer';

const AppNavigator = createStackNavigator(
	{
		Home: { screen: Home },
		Details: { screen: DetailsContainer }
	},
	{
		initialRouteName: 'Home'
	}
);
const AppContainer = createAppContainer(AppNavigator);

export default AppContainer;
