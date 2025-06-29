// styles/LoginScreenStyles.js
import { StyleSheet } from 'react-native';

export const loginStyles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        marginBottom: 40
    },
    authContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        borderRadius: 20,
        margin: 30,
    },
    logo: {
        width: 100,
        height: 100,
        alignSelf: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#fff',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(221, 221, 221, 0.8)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    switchButton: {
        marginTop: 20,
        paddingVertical: 8,
        borderRadius: 5,
    },
    switchText: {
        color: '#007bff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
});