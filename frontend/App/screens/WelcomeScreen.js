import React from 'react';
import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import "@expo/metro-runtime";
export default function WelcomeScreen({navigation, route}){
    return (
        <View style={{flex:1, backgroundColor:'#fff'}}>
        <View style={{alignItems:'center', justifyContent:'center', height:'50%'}}>
            <Text style={{fontWeight:'bold', color:'#0874fc', fontSize:80}}>ZALO</Text>
        </View>
        <View style={{alignItems:'center', justifyContent:'center', flex:1}}>
            <TouchableOpacity style={{backgroundColor:'#186cfc', width:'80%', padding:15, marginBottom:10, borderRadius:25}} 
            >
                <Text style={{color:'white', textAlign:'center', fontSize:18, fontWeight:500}}>Đăng nhập</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{backgroundColor:'#f0ecec', padding:15, width:'80%', borderRadius:25}} onPress={()=>{navigation.navigate('signUp')}}>
                <Text style={{textAlign:'center',  fontSize:18, fontWeight:500}}>Tạo tài khoản mới</Text>
            </TouchableOpacity>
        </View>
        </View>
    );
}