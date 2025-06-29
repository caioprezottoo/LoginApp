// styles/HomeScreenStyles.js
import { StyleSheet } from 'react-native';

export const homeStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
    },
    userInfo: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        minWidth: '80%',
    },
    userEmail: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    logoutButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        minWidth: '60%',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});