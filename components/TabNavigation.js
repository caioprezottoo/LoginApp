// components/TabNavigation.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { tabStyles } from '../styles/TabNavigationStyles';
import { HomeTab, FavoritesTab, AddMovieTab, WatchedTab, ProfileTab } from '../screens/TabScreens';

const TabNavigation = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('Home');

    const tabs = [
        { key: 'Home', label: 'Home', icon: '🏠' },
        { key: 'Favorites', label: 'Favorites', icon: '❤️' },
        { key: 'AddMovie', label: 'Add Movie', icon: '➕' },
        { key: 'Watched', label: 'Watched', icon: '✅' },
        { key: 'Profile', label: 'Profile', icon: '👤' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Home':
                return <HomeTab navigation={navigation} />;
            case 'Favorites':
                return <FavoritesTab />;
            case 'AddMovie':
                return <AddMovieTab />;
            case 'Watched':
                return <WatchedTab />;
            case 'Profile':
                return <ProfileTab navigation={navigation} />;
            default:
                return <HomeTab navigation={navigation} />;
        }
    };

    return (
        <SafeAreaView style={tabStyles.container}>
            {/* Main Content */}
            <View style={{ flex: 1 }}>
                {renderTabContent()}
            </View>

            {/* Tab Bar */}
            <View style={tabStyles.tabBar}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            tabStyles.tabItem,
                            activeTab === tab.key && tabStyles.activeTabItem,
                        ]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text
                            style={[
                                tabStyles.tabIcon,
                                activeTab === tab.key && tabStyles.activeTabIcon,
                            ]}
                        >
                            {tab.icon}
                        </Text>
                        <Text
                            style={[
                                tabStyles.tabText,
                                activeTab === tab.key && tabStyles.activeTabText,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};

export default TabNavigation;