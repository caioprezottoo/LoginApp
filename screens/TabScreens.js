// screens/TabScreens.js
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { auth } from '../firebase';
import { tabStyles } from '../styles/TabNavigationStyles';

// Home Screen Component
const HomeTab = ({ navigation }) => {
    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigation.navigate('Login');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const confirmLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: handleLogout },
            ]
        );
    };

    return (
        <View style={tabStyles.content}>
            <Text style={tabStyles.screenTitle}>Welcome!</Text>
            <Text style={tabStyles.screenContent}>
                Your movie tracking app is ready to use.{'\n'}
                Navigate through the tabs to manage your movies.
            </Text>

            <View style={tabStyles.userInfo}>
                <Text style={tabStyles.userEmail}>
                    {auth.currentUser?.email}
                </Text>
            </View>

            <TouchableOpacity style={tabStyles.logoutButton} onPress={confirmLogout}>
                <Text style={tabStyles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

// Favorites Screen Component
const FavoritesTab = () => {
    return (
        <View style={tabStyles.content}>
            <Text style={tabStyles.screenTitle}>Favorites</Text>
            <Text style={tabStyles.screenContent}>
                Your favorite movies will appear here.{'\n'}
                Start adding movies to see them in your favorites list!
            </Text>
        </View>
    );
};

// Add Movie Screen Component
const AddMovieTab = () => {
    return (
        <View style={tabStyles.content}>
            <Text style={tabStyles.screenTitle}>Add Movie</Text>
            <Text style={tabStyles.screenContent}>
                Add new movies to your collection.{'\n'}
                Search and save movies you want to track.
            </Text>
        </View>
    );
};

// Watched Movies Screen Component
const WatchedTab = () => {
    return (
        <View style={tabStyles.content}>
            <Text style={tabStyles.screenTitle}>Watched</Text>
            <Text style={tabStyles.screenContent}>
                Keep track of movies you've already watched.{'\n'}
                Rate and review your watched movies.
            </Text>
        </View>
    );
};

// Profile Screen Component
const ProfileTab = ({ navigation }) => {
    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigation.navigate('Login');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const confirmLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: handleLogout },
            ]
        );
    };

    return (
        <View style={tabStyles.content}>
            <Text style={tabStyles.screenTitle}>Profile</Text>

            <View style={tabStyles.userInfo}>
                <Text style={tabStyles.userEmail}>
                    {auth.currentUser?.email}
                </Text>
            </View>

            <Text style={tabStyles.screenContent}>
                Manage your account settings and preferences.
            </Text>

            <TouchableOpacity style={tabStyles.logoutButton} onPress={confirmLogout}>
                <Text style={tabStyles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

// Export all components
export { HomeTab, FavoritesTab, AddMovieTab, WatchedTab, ProfileTab };