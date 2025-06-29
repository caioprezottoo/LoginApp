// HomeScreen.js (Clean Version with Tab Navigation)
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from './firebase';
import { tabStyles } from './styles/TabNavigationStyles';

// Individual Tab Components
const HomeTab = ({ navigation }) => {
    const [currentMovie, setCurrentMovie] = useState(null);
    const [movies, setMovies] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // Buscar filmes do Firestore
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const moviesCollection = await firestore.collection('filmes').get();
                const moviesData = [];

                moviesCollection.forEach(doc => {
                    moviesData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                setMovies(moviesData);
                if (moviesData.length > 0) {
                    setCurrentMovie(moviesData[0]);
                }
                setLoading(false);
            } catch (error) {
                console.error('Erro ao buscar filmes:', error);
                Alert.alert('Erro', 'Não foi possível carregar os filmes');
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    const getNextMovie = () => {
        if (movies.length === 0) return;

        const nextIndex = (currentIndex + 1) % movies.length;
        setCurrentIndex(nextIndex);
        setCurrentMovie(movies[nextIndex]);
    };

    const handleWatchedPress = () => {
        console.log('Filme marcado como assistido:', currentMovie?.titulo);
        // Future: Salvar no Firebase como assistido
        getNextMovie(); // Vai para o próximo filme
    };

    const handleAddPress = () => {
        console.log('Filme adicionado aos favoritos:', currentMovie?.titulo);
        // Future: Adicionar aos favoritos no Firebase
    };

    const handleDidntWatchPress = () => {
        console.log('Filme marcado como não assistido:', currentMovie?.titulo);
        // Future: Salvar no Firebase como não assistido
        getNextMovie(); // Vai para o próximo filme
    };

    if (loading) {
        return (
            <View style={tabStyles.content}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={[tabStyles.screenContent, { marginTop: 20 }]}>
                    Carregando filmes...
                </Text>
            </View>
        );
    }

    if (!currentMovie) {
        return (
            <View style={tabStyles.content}>
                <Text style={tabStyles.screenTitle}>Nenhum filme encontrado</Text>
                <Text style={tabStyles.screenContent}>
                    Adicione filmes à coleção "filmes" no Firestore
                </Text>
            </View>
        );
    }

    return (
        <View style={tabStyles.content}>
            <View style={tabStyles.movieCard}>
                <View style={tabStyles.moviePoster}>
                    {currentMovie.capa ? (
                        <Image
                            source={{ uri: currentMovie.capa }}
                            style={tabStyles.posterImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <Text style={tabStyles.posterPlaceholder}>
                            Imagem não disponível
                        </Text>
                    )}
                </View>

                <View style={tabStyles.movieInfo}>
                    <Text style={tabStyles.movieTitle}>
                        {currentMovie.titulo || 'Título não disponível'}
                    </Text>

                    <View style={tabStyles.actionButtons}>
                        <TouchableOpacity
                            style={tabStyles.watchedButton}
                            onPress={handleWatchedPress}
                        >
                            <Ionicons name="eye" size={32} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={tabStyles.addButton}
                            onPress={handleAddPress}
                        >
                            <Ionicons name="add" size={24} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={tabStyles.didntWatchButton}
                            onPress={handleDidntWatchPress}
                        >
                            <Ionicons name="close" size={32} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

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

// Main HomeScreen Component with Tab Navigation
const HomeScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('Home');

    const tabs = [
        {
            key: 'Home',
            icon: 'home',
            activeIcon: 'home'
        },
        {
            key: 'Favorites',
            icon: 'star-outline',
            activeIcon: 'star'
        },
        {
            key: 'AddMovie',
            icon: 'add',
            activeIcon: 'add'
        },
        {
            key: 'Watched',
            icon: 'checkmark-circle-outline',
            activeIcon: 'checkmark-circle'
        },
        {
            key: 'Profile',
            icon: 'person-outline',
            activeIcon: 'person'
        },
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
        <View style={tabStyles.container}>
            {/* Main Content */}
            <SafeAreaView style={{ flex: 1 }}>
                {renderTabContent()}
            </SafeAreaView>

            {/* Tab Bar */}
            <View style={tabStyles.tabBar}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;

                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                tabStyles.tabItem,
                                isActive && tabStyles.activeTabItem,
                            ]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <Ionicons
                                name={isActive ? tab.activeIcon : tab.icon}
                                size={24}
                                color={isActive ? '#fff' : '#888'}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default HomeScreen;