import React,{useRef,useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import OTPTextInput from 'react-native-otp-textinput';
export default function OTPScreen({navigation, route}){
    const {phoneNumber} = route.params;
    const otpInput= useRef(null);
    const [otp, setOtp] = useState('');
    return(
        <View style={{flex:1, backgroundColor:'#ffff'}}>
            <Text style={{textAlign:'center', fontWeight:'bold', fontSize:25, marginTop:20}}>Nhập mã xác thực</Text>
            <Text style={{ textAlign:'center',alignItems:'center',  justifyContent:'center', padding:15, fontSize:15}}>Đang gửi tin nhắn đến số  <Text style={{fontWeight:'bold', fontSize:16}}>{phoneNumber}.</Text> <Text>Vui lòng xem tin nhắn và nhập mã xác thực gồm 6 chữ số.</Text></Text>
            <OTPTextInput
                ref={otpInput}
                inputCount={6}
                tintColor='#0a64f4'
                containerStyle={{marginTop:10, padding:0}}
                textInputStyle={{borderWidth:2, borderRadius:10}}
                handleTextChange={(otp)=> setOtp(otp)}
            />
            <TouchableOpacity
        style={[
          styles.continueButton,
          { backgroundColor: otp.length === 6 ? '#0a64f4' : '#b0c4de' },
         
        ]}
        onPress={()=>{navigation.navigate('')}}
        disabled={otp.length !== 6} 
      >
        <Text style={{color: otp.length === 6 ? '#fff' : 'grey', fontWeight:500, fontSize:18 }}>Tiếp tục</Text>
      </TouchableOpacity>
      <Text style={{marginTop:20,fontWeight:500, fontSize:16, textAlign:'center' }}>Bạn không nhận được mã?</Text>
        </View>
    )
}
const styles = StyleSheet.create({
    continueButton: {
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  }
})