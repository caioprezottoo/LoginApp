// components/RatingModal.js
import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const RatingModal = ({ visible, onClose, onSubmit, movieTitle }) => {
    const [rating, setRating] = useState(0);
    const [fadeAnim] = useState(new Animated.Value(0));

    React.useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            setRating(0);
        }
    }, [visible]);

    const handleSubmit = () => {
        onSubmit(rating);
        handleClose();
    };

    const handleClose = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setRating(0);
            onClose();
        });
    };

    const renderStars = () => {
        return Array.from({ length: 5 }, (_, index) => {
            const starNumber = index + 1;
            return (
                <TouchableOpacity
                    key={starNumber}
                    onPress={() => setRating(starNumber)}
                    style={styles.starButton}
                >
                    <Ionicons
                        name={starNumber <= rating ? 'star' : 'star-outline'}
                        size={40}
                        color={starNumber <= rating ? '#FFD700' : '#666'}
                    />
                </TouchableOpacity>
            );
        });
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
                    <View style={styles.modal}>
                        <Text style={styles.title}>Avalie o filme</Text>
                        <Text style={styles.movieTitle}>{movieTitle}</Text>


                        <View style={styles.starsContainer}>
                            {renderStars()}
                        </View>

                        <Text style={styles.ratingText}>
                            {rating === 0 ? 'No rating' : `${rating} estrela${rating !== 1 ? 's' : ''}`}
                        </Text>

                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleClose}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.submitButton]}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.submitButtonText}>Avaliar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.85,
        maxWidth: 400,
    },
    modal: {
        backgroundColor: '#2a2a2a',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    movieTitle: {
        fontSize: 18,
        color: '#ccc',
        textAlign: 'center',
        marginBottom: 25,
        fontStyle: 'italic',
    },
    instruction: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 20,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    starButton: {
        marginHorizontal: 5,
        padding: 5,
    },
    ratingText: {
        fontSize: 16,
        color: '#ccc',
        marginBottom: 30,
        minHeight: 20,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#444',
    },
    submitButton: {
        backgroundColor: '#4A90E2',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default RatingModal;