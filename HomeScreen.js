import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, Image, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from './firebase';
import { tabStyles } from './styles/TabNavigationStyles';
import RatingModal from './components/RatingModal';

const HomeTab = ({ navigation }) => {
    const [currentMovie, setCurrentMovie] = useState(null);
    const [movies, setMovies] = useState([]);
    const [reviewedMovieIds, setReviewedMovieIds] = useState(new Set());
    const [favoriteMovieIds, setFavoriteMovieIds] = useState(new Set());
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(false);

    useEffect(() => {
        const fetchMoviesAndData = async () => {
            try {
                const userId = auth.currentUser?.uid;
                if (!userId) return;

                // Fetch reviewed movies
                const reviewsCollection = await firestore
                    .collection('avaliacao')
                    .where('usuario.id', '==', userId)
                    .get();

                const reviewedIds = new Set();
                reviewsCollection.forEach(doc => {
                    const data = doc.data();
                    if (data.movieId) {
                        reviewedIds.add(data.movieId);
                    }
                });
                setReviewedMovieIds(reviewedIds);

                // Fetch favorite movies
                const favoritesCollection = await firestore
                    .collection('favoritos')
                    .where('usuario.id', '==', userId)
                    .get();

                const favoriteIds = new Set();
                favoritesCollection.forEach(doc => {
                    const data = doc.data();
                    if (data.movieId) {
                        favoriteIds.add(data.movieId);
                    }
                });
                setFavoriteMovieIds(favoriteIds);

                // Fetch all movies and filter out only reviewed ones
                const moviesCollection = await firestore.collection('filmes').get();
                const moviesData = [];

                moviesCollection.forEach(doc => {
                    const movieData = {
                        id: doc.id,
                        ...doc.data()
                    };
                    if (!reviewedIds.has(doc.id)) {
                        moviesData.push(movieData);
                    }
                });

                setMovies(moviesData);
                if (moviesData.length > 0) {
                    setCurrentMovie(moviesData[0]);
                }
                setLoading(false);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                Alert.alert('Erro', 'Não foi possível carregar os dados');
                setLoading(false);
            }
        };

        fetchMoviesAndData();
    }, []);

    const getNextMovie = () => {
        if (movies.length === 0) return;

        const nextIndex = (currentIndex + 1) % movies.length;
        setCurrentIndex(nextIndex);
        setCurrentMovie(movies[nextIndex]);
    };

    const handleWatchedPress = () => {
        setShowRatingModal(true);
    };

    const handleRatingSubmit = async (rating) => {
        try {
            const userId = auth.currentUser?.uid;
            const userEmail = auth.currentUser?.email;
            if (!userId || !currentMovie) return;

            const avaliacaoData = {
                capa: currentMovie.capa || '',
                titulo: currentMovie.titulo || '',
                usuario: {
                    id: userId,
                    email: userEmail
                },
                quando: new Date(),
                rating: rating,
                movieId: currentMovie.id,
                isFavorite: false
            };

            await firestore.collection('avaliacao').add(avaliacaoData);

            console.log('Filme avaliado e salvo na coleção avaliacao:', currentMovie?.titulo, 'Rating:', rating);
            Alert.alert('Sucesso', `Filme avaliado com ${rating} estrela${rating !== 1 ? 's' : ''}!`);

            setReviewedMovieIds(prev => new Set([...prev, currentMovie.id]));

            const updatedMovies = movies.filter(movie => movie.id !== currentMovie.id);
            setMovies(updatedMovies);

            if (updatedMovies.length > 0) {
                const nextIndex = currentIndex >= updatedMovies.length ? 0 : currentIndex;
                setCurrentIndex(nextIndex);
                setCurrentMovie(updatedMovies[nextIndex]);
            } else {
                setCurrentMovie(null);
            }
        } catch (error) {
            console.error('Erro ao salvar avaliação:', error);
            Alert.alert('Erro', 'Não foi possível salvar a avaliação');
        }
    };

    const handleAddPress = async () => {
        try {
            const userId = auth.currentUser?.uid;
            const userEmail = auth.currentUser?.email;
            if (!userId || !currentMovie) return;

            const favoritoData = {
                capa: currentMovie.capa || '',
                titulo: currentMovie.titulo || '',
                usuario: {
                    id: userId,
                    email: userEmail
                },
                quando: new Date(),
                movieId: currentMovie.id
            };

            await firestore.collection('favoritos').add(favoritoData);

            console.log('Filme adicionado aos favoritos:', currentMovie?.titulo);
            Alert.alert('Sucesso', 'Filme adicionado aos favoritos!');

            setFavoriteMovieIds(prev => new Set([...prev, currentMovie.id]));

            // Don't remove the movie from the home screen when favorited
            // Only show success message
        } catch (error) {
            console.error('Erro ao adicionar aos favoritos:', error);
            Alert.alert('Erro', 'Não foi possível adicionar aos favoritos');
        }
    };

    const handleDidntWatchPress = () => {
        getNextMovie();
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

    if (!currentMovie || movies.length === 0) {
        return (
            <View style={tabStyles.content}>
                <Text style={tabStyles.screenTitle}>Todos os filmes avaliados!</Text>
                <Text style={tabStyles.screenContent}>
                    Você já avaliou todos os filmes disponíveis.{'\n'}
                    Adicione mais filmes à coleção "filmes" no Firestore{'\n'}
                    ou veja suas avaliações na aba "Watched".
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
                            style={[
                                tabStyles.addButton,
                                favoriteMovieIds.has(currentMovie.id) && tabStyles.addButtonFavorited
                            ]}
                            onPress={handleAddPress}
                        >
                            <Ionicons
                                name={favoriteMovieIds.has(currentMovie.id) ? "heart" : "heart-outline"}
                                size={24}
                                color="#fff"
                            />
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

            <RatingModal
                visible={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                onSubmit={handleRatingSubmit}
                movieTitle={currentMovie?.titulo}
            />
        </View>
    );
};

const FavoritesTab = () => {
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavoriteMovies = async () => {
            try {
                const userId = auth.currentUser?.uid;
                if (!userId) return;

                const favoritosCollection = await firestore
                    .collection('favoritos')
                    .where('usuario.id', '==', userId)
                    .get();

                const favoritesData = [];
                favoritosCollection.forEach(doc => {
                    favoritesData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                // Sort by date added (most recent first)
                favoritesData.sort((a, b) => {
                    const dateA = a.quando?.toDate ? a.quando.toDate() : new Date(a.quando);
                    const dateB = b.quando?.toDate ? b.quando.toDate() : new Date(b.quando);
                    return dateB - dateA;
                });

                setFavoriteMovies(favoritesData);
                setLoading(false);
            } catch (error) {
                console.error('Erro ao buscar favoritos:', error);
                setLoading(false);
            }
        };

        fetchFavoriteMovies();
    }, []);

    const removeFavorite = async (favoriteId) => {
        Alert.alert(
            'Remover dos Favoritos',
            'Tem certeza que deseja remover este filme dos favoritos?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await firestore.collection('favoritos').doc(favoriteId).delete();

                            setFavoriteMovies(prevMovies =>
                                prevMovies.filter(movie => movie.id !== favoriteId)
                            );

                            Alert.alert('Sucesso', 'Filme removido dos favoritos!');
                        } catch (error) {
                            console.error('Erro ao remover favorito:', error);
                            Alert.alert('Erro', 'Não foi possível remover dos favoritos');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={tabStyles.content}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={[tabStyles.screenContent, { marginTop: 20 }]}>
                    Carregando favoritos...
                </Text>
            </View>
        );
    }

    if (favoriteMovies.length === 0) {
        return (
            <View style={tabStyles.content}>
                <Text style={tabStyles.screenTitle}>Favoritos</Text>
                <Text style={tabStyles.screenContent}>
                    Nenhum filme favorito ainda.{'\n'}
                    Adicione filmes aos favoritos na tela inicial!
                </Text>
            </View>
        );
    }

    return (
        <View style={[tabStyles.content, { paddingTop: 60, alignItems: 'flex-start' }]}>
            <Text style={[tabStyles.screenTitle, { alignSelf: 'center', marginBottom: 30 }]}>Favoritos</Text>

            <ScrollView
                style={tabStyles.favoritesScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tabStyles.favoritesScrollContent}
            >
                <View style={tabStyles.favoritesGrid}>
                    {favoriteMovies.map((movie) => (
                        <View key={movie.id} style={tabStyles.favoriteItem}>
                            <View style={tabStyles.favoritePoster}>
                                {movie.capa ? (
                                    <Image
                                        source={{ uri: movie.capa }}
                                        style={tabStyles.favoritePosterImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={tabStyles.favoritePosterPlaceholder}>
                                        <Text style={tabStyles.favoritePlaceholderText}>No Image</Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={tabStyles.favoriteDeleteButton}
                                    onPress={() => removeFavorite(movie.id)}
                                >
                                    <Ionicons name="close" size={16} color="#ffffff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
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
    const [watchedMovies, setWatchedMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWatchedMovies = async () => {
            try {
                const userId = auth.currentUser?.uid;
                if (!userId) return;

                const avaliacaoCollection = await firestore
                    .collection('avaliacao')
                    .where('usuario.id', '==', userId)
                    .get();

                const watchedData = [];
                avaliacaoCollection.forEach(doc => {
                    watchedData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                watchedData.sort((a, b) => {
                    const dateA = a.quando?.toDate ? a.quando.toDate() : new Date(a.quando);
                    const dateB = b.quando?.toDate ? b.quando.toDate() : new Date(b.quando);
                    return dateB - dateA;
                });

                setWatchedMovies(watchedData);
                setLoading(false);
            } catch (error) {
                console.error('Erro ao buscar avaliações:', error);
                setLoading(false);
            }
        };

        fetchWatchedMovies();
    }, []);

    const deleteReview = async (reviewId, movieId) => {
        Alert.alert(
            'Deletar Avaliação',
            'Tem certeza que deseja deletar esta avaliação?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Deletar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await firestore.collection('avaliacao').doc(reviewId).delete();

                            setWatchedMovies(prevMovies =>
                                prevMovies.filter(movie => movie.id !== reviewId)
                            );

                            Alert.alert('Sucesso', 'Avaliação deletada com sucesso!');
                        } catch (error) {
                            console.error('Erro ao deletar avaliação:', error);
                            Alert.alert('Erro', 'Não foi possível deletar a avaliação');
                        }
                    }
                }
            ]
        );
    };

    const addToFavorites = async (movie) => {
        try {
            const userId = auth.currentUser?.uid;
            const userEmail = auth.currentUser?.email;
            if (!userId) return;

            // Check if already in favorites
            const existingFavorite = await firestore
                .collection('favoritos')
                .where('usuario.id', '==', userId)
                .where('movieId', '==', movie.movieId)
                .get();

            if (!existingFavorite.empty) {
                Alert.alert('Aviso', 'Este filme já está nos seus favoritos!');
                return;
            }

            const favoritoData = {
                capa: movie.capa || '',
                titulo: movie.titulo || '',
                usuario: {
                    id: userId,
                    email: userEmail
                },
                quando: new Date(),
                movieId: movie.movieId
            };

            await firestore.collection('favoritos').add(favoritoData);
            Alert.alert('Sucesso', 'Filme adicionado aos favoritos!');
        } catch (error) {
            console.error('Erro ao adicionar aos favoritos:', error);
            Alert.alert('Erro', 'Não foi possível adicionar aos favoritos');
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Ionicons
                key={index}
                name={index < rating ? 'star' : 'star-outline'}
                size={16}
                color={index < rating ? '#FFD700' : '#666'}
                style={{ marginRight: 2 }}
            />
        ));
    };

    if (loading) {
        return (
            <View style={tabStyles.content}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={[tabStyles.screenContent, { marginTop: 20 }]}>
                    Carregando avaliações...
                </Text>
            </View>
        );
    }

    if (watchedMovies.length === 0) {
        return (
            <View style={tabStyles.content}>
                <Text style={tabStyles.screenTitle}>Assistidos</Text>
                <Text style={tabStyles.screenContent}>
                    Nenhum Filme Assistido.{'\n'}
                </Text>
            </View>
        );
    }

    return (
        <View style={[tabStyles.content, { paddingTop: 60 }]}>
            <Text style={tabStyles.screenTitle}>Assistidos</Text>

            <ScrollView
                style={tabStyles.watchedScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tabStyles.watchedScrollContent}
            >
                {watchedMovies.map((movie) => (
                    <View key={movie.id} style={tabStyles.watchedItem}>
                        <View style={tabStyles.watchedPoster}>
                            {movie.capa ? (
                                <Image
                                    source={{ uri: movie.capa }}
                                    style={tabStyles.watchedPosterImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={tabStyles.watchedPosterPlaceholder}>
                                    <Text style={tabStyles.posterPlaceholderText}>No Image</Text>
                                </View>
                            )}
                        </View>

                        <View style={tabStyles.watchedInfo}>
                            <View style={tabStyles.watchedHeader}>
                                <Text style={tabStyles.watchedTitle}>{movie.titulo}</Text>
                                <TouchableOpacity
                                    style={tabStyles.deleteButton}
                                    onPress={() => deleteReview(movie.id, movie.movieId)}
                                >
                                    <Ionicons name="close" size={18} color="#ffffff" />
                                </TouchableOpacity>
                            </View>

                            <View style={tabStyles.watchedRating}>
                                {renderStars(movie.rating)}
                            </View>

                            <TouchableOpacity
                                style={tabStyles.favoriteButton}
                                onPress={() => addToFavorites(movie)}
                            >
                                <Ionicons name="heart-outline" size={20} color="#E53E3E" />
                                <Text style={[tabStyles.favoriteText, { color: '#E53E3E' }]}>
                                    Adicionar aos Favoritos
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
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