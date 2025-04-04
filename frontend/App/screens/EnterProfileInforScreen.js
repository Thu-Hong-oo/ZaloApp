import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PersonalInfoScreen = () => {
  const [birthDate, setBirthDate] = useState('1/1/1990');
  const [gender, setGender] = useState('Nam');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  
  // State for date picker
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(1990);
  
  // Generate arrays for days, months, and years
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 100 }, (_, i) => 2023 - i);

  const handleSelectDate = () => {
    setBirthDate(`${selectedDay}/${selectedMonth}/${selectedYear}`);
    setShowDatePicker(false);
  };

  const handleSelectGender = (selectedGender) => {
    setGender(selectedGender);
    setShowGenderPicker(false);
  };

  const renderDateColumn = (data, selectedValue, setSelectedValue) => {
    return (
      <View style={styles.dateColumnContainer}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dateOptionContainer}
              onPress={() => setSelectedValue(item)}
            >
              <Text
                style={[
                  styles.dateOption,
                  item === selectedValue && styles.selectedDate,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={data.indexOf(selectedValue)}
          getItemLayout={(data, index) => ({
            length: 50,
            offset: 50 * index,
            index,
          })}
          snapToInterval={50}
          decelerationRate="fast"
          contentContainerStyle={styles.dateColumnContent}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Screen */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm thông tin cá nhân</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Date Input */}
        <TouchableOpacity 
          style={styles.inputContainer}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={birthDate ? styles.inputText : styles.placeholderText}>
            {birthDate || 'Sinh nhật'}
          </Text>
          <Ionicons name="calendar-outline" size={24} color="#999" />
        </TouchableOpacity>

        {/* Gender Input */}
        <TouchableOpacity 
          style={styles.inputContainer}
          onPress={() => setShowGenderPicker(true)}
        >
          <Text style={gender ? styles.inputText : styles.placeholderText}>
            {gender || 'Giới tính'}
          </Text>
          <Ionicons name="chevron-down" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.continueButton}>
          <Text style={styles.continueButtonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngày sinh</Text>
            </View>
            
            <View style={styles.datePickerContainer}>
              {renderDateColumn(days, selectedDay, setSelectedDay)}
              {renderDateColumn(months, selectedMonth, setSelectedMonth)}
              {renderDateColumn(years, selectedYear, setSelectedYear)}
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={handleSelectDate}
              >
                <Text style={styles.selectButtonText}>Chọn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn giới tính</Text>
            </View>
            
            <View style={styles.genderPickerContainer}>
              <TouchableOpacity 
                style={styles.genderOption}
                onPress={() => handleSelectGender('Nam')}
              >
                <Text style={styles.genderOptionText}>Nam</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.genderOption}
                onPress={() => handleSelectGender('Nữ')}
              >
                <Text style={styles.genderOptionText}>Nữ</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.genderOption}
                onPress={() => handleSelectGender('Không chia sẻ')}
              >
                <Text style={styles.genderOptionText}>Không chia sẻ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  formContainer: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  placeholderText: {
    color: '#999999',
    fontSize: 16,
  },
  inputText: {
    color: '#000000',
    fontSize: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
  },
  continueButton: {
    backgroundColor: '#0068FF',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 150,
    paddingVertical: 20,
  },
  dateColumnContainer: {
    flex: 1,
    height: 150,
  },
  dateColumnContent: {
    paddingVertical: 50,
  },
  dateOptionContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateOption: {
    fontSize: 18,
    color: '#999999',
  },
  selectedDate: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalFooter: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  selectButton: {
    backgroundColor: '#0068FF',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  genderPickerContainer: {
    paddingVertical: 10,
  },
  genderOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  genderOptionText: {
    fontSize: 16,
    color: '#000000',
  },
});

export default PersonalInfoScreen;