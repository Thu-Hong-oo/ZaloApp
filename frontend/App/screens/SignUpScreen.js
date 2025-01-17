import React, {useState} from 'react';
import { View, Text, ScrollView, Image,Modal, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, TouchableHighlight } from 'react-native';
import { CheckBox } from 'react-native-elements';
export default function SignUpScreen({navigation, route}){
    const [isChecked, setIsChecked] = useState(false);
    const [isChecked2, setIsChecked2]= useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const isButtonEnabled = isChecked && isChecked2 && phoneNumber.length === 10;
    
    return (
<View style={{backgroundColor:'#fff', flex:1, justifyContent:'space-between'}}>
    <View>
        <Text style={{fontSize:25, fontWeight:'bold', textAlign:'center', marginTop:15, marginBottom:25}}>Nhập số điện thoại</Text>

       <View style={{flexDirection:'row', borderWidth:1, width:'90%', borderRadius:10, alignSelf:'center', borderColor:'#0c5ccc'}}>
        <Text style={{backgroundColor:'#ecf4fc', padding:15, borderTopLeftRadius:10, borderBottomLeftRadius:10, fontSize:20}}>+84</Text>
       <TextInput style={{flex:1, padding:15}}
       value={phoneNumber}
       onChangeText={setPhoneNumber}
       keyboardType='numeric'
       maxLength={10}
        />
       </View>
       {/* Checkbox */}
       <View>
       <View style={{flexDirection:'row', alignItems:'center', marginBottom:-15}}>
       <CheckBox checked={isChecked} onPress={()=> setIsChecked(!isChecked)}
       />
       <View style={{marginLeft:-15}}>
       <Text style={{fontSize:13}}>Tôi đồng ý với các
       <TouchableOpacity>
        <Text style={{color:"#1493f2", fontWeight:'bold', fontSize:14}}> điều khoản sử dụng Zalo</Text>
       </TouchableOpacity>
       </Text>
       </View>
       </View>
       <View style={{flexDirection:'row', alignItems:'center'}}>
       <CheckBox checked={isChecked2} onPress={()=> setIsChecked2(!isChecked2)} />
       <View style={{marginLeft:-15}}>
       <Text style={{fontSize:13}}>Tôi đồng ý với
       <TouchableOpacity>
        <Text style={{color:"#1493f2", fontWeight:'bold',fontSize:14}}> điều khoản Mạng xã hội của Zalo</Text>
       </TouchableOpacity>
       </Text>
       </View>
       </View>
       </View>
         {/* Button */}
        <TouchableOpacity 
        disabled={!isButtonEnabled} 
        onPress={()=> setIsModalVisible(true)}
        style={{backgroundColor: isButtonEnabled?'#0a64f4':'#b0c4de', width:'90%', padding:15, borderRadius:50, alignSelf:'center', marginTop:20, alignItems:'center'}}>
        <Text style={{color:'white', fontWeight:500, fontSize:15}}>Tiếp tục</Text>

        </TouchableOpacity>
    </View>
    <Modal visible={isModalVisible} animationType='fade' transparent={true} onRequestClose={()=> setIsModalVisible(false)}>
       <View style={{flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center'}}>
       <View style={{width:'80%', backgroundColor:'white', padding:20, borderRadius:10, alignItems:'center'}}>
        <View>
            <Text style={{fontWeight:'bold', fontSize:20}}>
                Nhận mã xác thực qua số 
            </Text>
            <Text style={{fontSize:20, fontWeight:'bold'}}>{phoneNumber}?</Text>
            <Text style={{fontSize:16, marginBottom:15, marginTop:15}}>Zalo sẽ gửi mã xác thực cho bạn qua số điện thoại này</Text>
        </View>
            <TouchableOpacity style={{borderBottomWidth:2, borderTopWidth:2, width:'100%', padding:10, borderColor:'#f0f0f0', alignItems:'center'}}
            onPress={()=> {setIsModalVisible(false); navigation.navigate('')}}
            >
                <Text style={{fontWeight:500, color:'#0a64f4', fontSize:16}}>
                    Tiếp tục
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={{padding:10}}
             onPress={()=> setIsModalVisible(false)}>
                <Text style={{fontWeight:500, fontSize:16}}>
                    Đổi số khác
                </Text>
            </TouchableOpacity>
        </View>
        </View>
        
    </Modal>
    <View>
        <Text style={{fontSize:14, textAlign:'center', marginBottom:'15%', fontWeight:400}}>Bạn đã có tài khoản?
        <TouchableOpacity onPress={()=> navigation.navigate('signIn')}>
        <Text style={{color:'#0a64f4', fontWeight:500, fontSize:16}}> Đăng nhập ngay</Text>
        </TouchableOpacity>
        </Text>
    
    </View>
</View>

    );
}