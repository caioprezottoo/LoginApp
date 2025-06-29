import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ImageBackground,
    Image
} from 'react-native';
import { auth } from './firebase';
import { loginStyles } from './styles/LoginScreenStyles';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);

    const handleAuthentication = async () => {
        try {
            if (isLogin) {
                // Sign in
                await auth.signInWithEmailAndPassword(email, password);
                navigation.navigate('Home');
            } else {
                // Sign up
                await auth.createUserWithEmailAndPassword(email, password);
                Alert.alert('Success', 'Account created successfully!');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <ImageBackground
            source={require('./assets/background.png')}
            style={loginStyles.backgroundImage}
            resizeMode="cover"
        >
            <KeyboardAvoidingView
                style={loginStyles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={loginStyles.authContainer}>

                    <Text style={loginStyles.title}>{isLogin ? 'Faça login' : 'Inscreva-se'}</Text>

                    <TextInput
                        style={loginStyles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <TextInput
                        style={loginStyles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Senha"
                        secureTextEntry
                    />

                    <TouchableOpacity style={loginStyles.button} onPress={handleAuthentication}>
                        <Text style={loginStyles.buttonText}>
                            {isLogin ? 'Entrar' : 'Criar conta'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={loginStyles.switchButton}
                        onPress={() => setIsLogin(!isLogin)}
                    >
                        <Text style={loginStyles.switchText}>
                            {isLogin
                                ? "Não tem conta? Crie uma aqui"
                                : 'Já tem uma conta? Faça o Login'}
                        </Text>
                    </TouchableOpacity>

                    <Image
                        source={require('./assets/logo.png')}
                        style={loginStyles.logo}
                        resizeMode="contain"
                    />
                </View>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

export default LoginScreen;