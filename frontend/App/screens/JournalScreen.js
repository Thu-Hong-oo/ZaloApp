import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const JournalScreen = ({ navigation }) => {
    const [entries, setEntries] = useState([]);
    const [newEntry, setNewEntry] = useState('');
    const [isAddingEntry, setIsAddingEntry] = useState(false);

    // Giả lập dữ liệu mẫu
    useEffect(() => {
        setEntries([
            {
                id: '1',
                content: 'Hôm nay là một ngày tuyệt vời!',
                date: new Date(),
                mood: 'happy'
            },
            {
                id: '2',
                content: 'Học được nhiều điều mới về React Native',
                date: new Date(Date.now() - 86400000), // Hôm qua
                mood: 'excited'
            }
        ]);
    }, []);

    const handleAddEntry = () => {
        if (newEntry.trim() === '') {
            Alert.alert('Thông báo', 'Vui lòng nhập nội dung nhật ký');
            return;
        }

        const entry = {
            id: Date.now().toString(),
            content: newEntry,
            date: new Date(),
            mood: 'happy'
        };

        setEntries([entry, ...entries]);
        setNewEntry('');
        setIsAddingEntry(false);
    };

    const renderEntry = (entry) => (
        <View key={entry.id} style={styles.entryContainer}>
            <Text style={styles.date}>
                {format(entry.date, "EEEE, dd/MM/yyyy", { locale: vi })}
            </Text>
            <Text style={styles.content}>{entry.content}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Nhật ký</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setIsAddingEntry(true)}
                >
                    <Ionicons name="add-circle" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            {isAddingEntry ? (
                <View style={styles.addEntryContainer}>
                    <TextInput
                        style={styles.input}
                        multiline
                        placeholder="Hôm nay của bạn thế nào?"
                        value={newEntry}
                        onChangeText={setNewEntry}
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => {
                                setIsAddingEntry(false);
                                setNewEntry('');
                            }}
                        >
                            <Text style={styles.buttonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleAddEntry}
                        >
                            <Text style={[styles.buttonText, styles.saveButtonText]}>
                                Lưu
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <ScrollView style={styles.entriesList}>
                    {entries.map(renderEntry)}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    addButton: {
        padding: 8,
    },
    entriesList: {
        flex: 1,
        padding: 16,
    },
    entryContainer: {
        backgroundColor: '#f8f8f8',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
    },
    addEntryContainer: {
        padding: 16,
    },
    input: {
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 16,
        minHeight: 120,
        fontSize: 16,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginLeft: 12,
    },
    cancelButton: {
        backgroundColor: '#f1f1f1',
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    saveButtonText: {
        color: '#fff',
    },
});

export default JournalScreen; 