import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, Image, ActivityIndicator, ScrollView, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from './firebase';
import firebase from './firebase';
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

                // Fetch movies from both collections
                const moviesData = [];

                // Fetch from original 'filmes' collection
                const moviesCollection = await firestore.collection('filmes').get();
                moviesCollection.forEach(doc => {
                    const movieData = {
                        id: doc.id,
                        ...doc.data(),
                        source: 'filmes' // Add source identifier
                    };
                    if (!reviewedIds.has(doc.id)) {
                        moviesData.push(movieData);
                    }
                });

                // Fetch from user's 'filmesUsuario' collection (only current user's movies)
                const userMoviesCollection = await firestore
                    .collection('filmesUsuario')
                    .where('adicionadoPor.id', '==', userId)
                    .where('ativo', '==', true)
                    .get();

                userMoviesCollection.forEach(doc => {
                    const movieData = {
                        id: doc.id,
                        ...doc.data(),
                        source: 'filmesUsuario' // Add source identifier
                    };
                    if (!reviewedIds.has(doc.id)) {
                        moviesData.push(movieData);
                    }
                });

                // Shuffle the movies array to mix both collections
                const shuffledMovies = moviesData.sort(() => Math.random() - 0.5);

                setMovies(shuffledMovies);
                if (shuffledMovies.length > 0) {
                    setCurrentMovie(shuffledMovies[0]);
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
                source: currentMovie.source, // Store the source collection
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
                movieId: currentMovie.id,
                source: currentMovie.source // Store the source collection
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
                    Adicione mais filmes na aba "Adicionar Filme"{'\n'}
                    ou veja suas avaliações na aba "Assistidos".
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

                    {/* Show movie source indicator */}
                    {currentMovie.source === 'filmesUsuario' && (
                        <Text style={tabStyles.movieSource}>
                            📱 Adicionado por você
                        </Text>
                    )}

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
    const [movieTitle, setMovieTitle] = useState('');
    const [moviePoster, setMoviePoster] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const clearForm = () => {
        setMovieTitle('');
        setMoviePoster('');
    };

    const validateForm = () => {
        if (!movieTitle.trim()) {
            Alert.alert('Erro', 'Por favor, digite o título do filme.');
            return false;
        }

        if (!moviePoster.trim()) {
            Alert.alert('Erro', 'Por favor, adicione a URL da capa do filme.');
            return false;
        }

        return true;
    };

    const handleAddMovie = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const userId = auth.currentUser?.uid;
            const userEmail = auth.currentUser?.email;

            if (!userId) {
                Alert.alert('Erro', 'Usuário não encontrado.');
                return;
            }

            const movieData = {
                titulo: movieTitle.trim(),
                capa: moviePoster.trim(),
                adicionadoPor: {
                    id: userId,
                    email: userEmail
                },
                dataAdicao: new Date(),
                ativo: true
            };

            await firestore.collection('filmesUsuario').add(movieData);

            Alert.alert(
                'Sucesso!',
                `O filme "${movieTitle}" foi adicionado com sucesso!`,
                [{ text: 'OK', onPress: clearForm }]
            );

        } catch (error) {
            console.error('Erro ao adicionar filme:', error);
            Alert.alert('Erro', 'Não foi possível adicionar o filme. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[tabStyles.content, { paddingTop: 60, alignItems: 'flex-start' }]}>
            <Text style={[tabStyles.screenTitle, { alignSelf: 'center', marginBottom: 30 }]}>
                Adicionar Filme
            </Text>

            <ScrollView
                style={tabStyles.addMovieScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tabStyles.addMovieScrollContent}
            >
                <View style={tabStyles.formContainer}>
                    {/* Movie Title */}
                    <View style={tabStyles.inputGroup}>
                        <Text style={tabStyles.inputLabel}>Título do Filme *</Text>
                        <TextInput
                            style={tabStyles.textInput}
                            value={movieTitle}
                            onChangeText={setMovieTitle}
                            placeholder="Digite o título do filme"
                            placeholderTextColor="#888"
                            maxLength={100}
                        />
                    </View>

                    {/* Movie Poster URL */}
                    <View style={tabStyles.inputGroup}>
                        <Text style={tabStyles.inputLabel}>URL da Capa *</Text>
                        <TextInput
                            style={tabStyles.textInput}
                            value={moviePoster}
                            onChangeText={setMoviePoster}
                            placeholder="https://exemplo.com/poster.jpg"
                            placeholderTextColor="#888"
                            keyboardType="url"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Preview Section */}
                    {movieTitle.trim() && moviePoster.trim() && (
                        <View style={tabStyles.previewSection}>
                            <Text style={tabStyles.previewTitle}>Pré-visualização:</Text>
                            <View style={tabStyles.previewCard}>
                                <View style={tabStyles.previewPoster}>
                                    <Image
                                        source={{ uri: moviePoster }}
                                        style={tabStyles.previewPosterImage}
                                        resizeMode="cover"
                                        onError={() => { }}
                                    />
                                </View>
                                <View style={tabStyles.previewInfo}>
                                    <Text style={tabStyles.previewMovieTitle}>{movieTitle}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={tabStyles.actionButtonsContainer}>
                        <TouchableOpacity
                            style={tabStyles.clearButton}
                            onPress={clearForm}
                            disabled={isLoading}
                        >
                            <Text style={tabStyles.clearButtonText}>Limpar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                tabStyles.addMovieButton,
                                (!movieTitle.trim() || !moviePoster.trim() || isLoading) && tabStyles.addMovieButtonDisabled
                            ]}
                            onPress={handleAddMovie}
                            disabled={!movieTitle.trim() || !moviePoster.trim() || isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="add" size={20} color="#fff" />
                                    <Text style={tabStyles.addMovieButtonText}>Adicionar Filme</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const WatchedTab = () => {
    const [watchedMovies, setWatchedMovies] = useState([]);
    const [favoriteMovieIds, setFavoriteMovieIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWatchedMovies = async () => {
            try {
                const userId = auth.currentUser?.uid;
                if (!userId) return;

                // Fetch watched movies
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

                // Fetch favorite movies to check which ones are already favorited
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

            // Update the local state to reflect the change
            setFavoriteMovieIds(prev => new Set([...prev, movie.movieId]));

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
                {watchedMovies.map((movie) => {
                    const isInFavorites = favoriteMovieIds.has(movie.movieId);

                    return (
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

                                {isInFavorites ? (
                                    <View style={tabStyles.favoriteIndicator}>
                                        <Ionicons name="heart" size={20} color="#E53E3E" />
                                        <Text style={tabStyles.favoriteIndicatorText}>
                                            Nos Favoritos
                                        </Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={tabStyles.favoriteButton}
                                        onPress={() => addToFavorites(movie)}
                                    >
                                        <Ionicons name="heart-outline" size={20} color="#E53E3E" />
                                        <Text style={[tabStyles.favoriteText, { color: '#E53E3E' }]}>
                                            Adicionar aos Favoritos
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const ProfileTab = ({ navigation }) => {
    const [showReauthModal, setShowReauthModal] = useState(false);
    const [password, setPassword] = useState('');

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigation.navigate('Login');
        } catch (error) {
            Alert.alert('Erro', error.message);
        }
    };

    const confirmLogout = () => {
        Alert.alert(
            'Logout',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', onPress: handleLogout },
            ]
        );
    };

    const reauthenticateUser = async (password) => {
        try {
            const user = auth.currentUser;
            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email,
                password
            );
            await user.reauthenticateWithCredential(credential);
            return true;
        } catch (error) {
            console.error('Erro na reautenticação:', error);
            Alert.alert('Erro', 'Senha incorreta. Tente novamente.');
            return false;
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            // Delete user's reviews
            const reviewsSnapshot = await firestore
                .collection('avaliacao')
                .where('usuario.id', '==', userId)
                .get();

            const reviewDeletePromises = reviewsSnapshot.docs.map(doc => doc.ref.delete());

            // Delete user's favorites
            const favoritesSnapshot = await firestore
                .collection('favoritos')
                .where('usuario.id', '==', userId)
                .get();

            const favoritesDeletePromises = favoritesSnapshot.docs.map(doc => doc.ref.delete());

            // Wait for all deletions to complete
            await Promise.all([...reviewDeletePromises, ...favoritesDeletePromises]);

            // Delete the user account
            await auth.currentUser.delete();

            Alert.alert('Sucesso', 'Conta deletada com sucesso!');
            navigation.navigate('Login');
        } catch (error) {
            console.error('Erro ao deletar conta:', error);
            Alert.alert('Erro', 'Não foi possível deletar a conta: ' + error.message);
        }
    };

    const handleReauthAndDelete = async () => {
        if (!password.trim()) {
            Alert.alert('Erro', 'Por favor, digite sua senha.');
            return;
        }

        const reauthSuccess = await reauthenticateUser(password);
        if (reauthSuccess) {
            setShowReauthModal(false);
            setPassword('');
            await handleDeleteAccount();
        }
    };

    const confirmDeleteAccount = () => {
        Alert.alert(
            'Deletar Conta',
            'ATENÇÃO: Esta ação é irreversível!\n\nTodos os seus dados serão permanentemente removidos:\n• Suas avaliações de filmes\n• Sua lista de favoritos\n• Sua conta de usuário\n\nTem certeza que deseja continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Deletar Conta',
                    style: 'destructive',
                    onPress: () => setShowReauthModal(true)
                },
            ]
        );
    };

    return (
        <View style={tabStyles.content}>
            <Text style={tabStyles.screenTitle}>Perfil</Text>

            <View style={tabStyles.userInfo}>
                <Text style={tabStyles.userEmail}>
                    {auth.currentUser?.email}
                </Text>
            </View>

            <Text style={tabStyles.screenContent}>
                Gerencie as configurações da sua conta e preferências.
            </Text>

            <TouchableOpacity style={tabStyles.logoutButton} onPress={confirmLogout}>
                <Text style={tabStyles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>

            <TouchableOpacity style={tabStyles.deleteAccountButton} onPress={confirmDeleteAccount}>
                <Text style={tabStyles.deleteAccountButtonText}>Deletar Conta</Text>
            </TouchableOpacity>

            {/* Re-authentication Modal */}
            <Modal
                visible={showReauthModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                    setShowReauthModal(false);
                    setPassword('');
                }}
            >
                <View style={tabStyles.modalOverlay}>
                    <View style={tabStyles.modalContainer}>
                        <Text style={tabStyles.modalTitle}>Confirmação de Segurança</Text>
                        <Text style={tabStyles.modalSubtitle}>
                            Digite sua senha para confirmar a exclusão da conta:
                        </Text>

                        <TextInput
                            style={tabStyles.modalInput}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Sua senha"
                            secureTextEntry
                            autoFocus
                        />

                        <View style={tabStyles.modalButtons}>
                            <TouchableOpacity
                                style={tabStyles.modalCancelButton}
                                onPress={() => {
                                    setShowReauthModal(false);
                                    setPassword('');
                                }}
                            >
                                <Text style={tabStyles.modalCancelText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={tabStyles.modalDeleteButton}
                                onPress={handleReauthAndDelete}
                            >
                                <Text style={tabStyles.modalDeleteText}>Deletar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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