import React,{useState} from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, SafeAreaView, TouchableHighlight } from 'react-native';
import {TextInput} from 'react-native-paper';
export default function SignInScreen({navigation, route}){
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const checkedSignInButton = phone && password;
    return (
        <View style={{flex: 1, backgroundColor: 'white', justifyContent:'space-between'}}>
        <View>
        <Text style={{backgroundColor:'#f8f4fc', padding:15}}>Vui lòng nhập số điện thoại và mật khẩu để đăng nhập</Text>
        
           <TextInput placeholder='Số điện thoại' style={{backgroundColor:'#ffff', width:'90%', alignSelf:'center'}}
           theme={{colors:{primary:'#0c5ccc'}}}
            value={phone}
            onChangeText={setPhone}
           right={<TextInput.Icon icon="close" size={25} />}
           />
           <TextInput placeholder='Mật khẩu' style={{backgroundColor:'#ffff', width:'90%', alignSelf:'center'}}
           theme={{colors:{primary:'#0c5ccc'}}}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            right={
            <TextInput.Icon icon={showPassword ? "eye-off" : "eye"} size={30} onPress={() => setShowPassword(!showPassword)   }/>
            }
            />
            <TouchableOpacity>
                <Text style={{color:'#2596be', fontWeight:'bold', margin:25, fontSize:16}}>Lấy lại mật khẩu</Text>
            </TouchableOpacity>
        </View>
        <View style={{marginBottom:'10%', marginLeft:'5%', flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
            <Text style={{color:'grey', fontWeight:500}}>Câu hỏi thường gặp &gt; </Text>
            <TouchableOpacity style={{marginRight:'5%'}}>
            {checkedSignInButton &&<Image source={require('../assets/arrow.png')} style={{width:50, height:50}}/>}
            </TouchableOpacity>
        </View>
        </View>
    )

}