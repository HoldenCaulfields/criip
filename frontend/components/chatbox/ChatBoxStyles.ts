import { StyleSheet, Platform } from 'react-native';

// --- Constants (Required for the styles) ---
const PRIMARY_BLUE = '#007aff';
const SECONDARY_BG = '#f0f2f5';
const THEM_BUBBLE_COLOR = '#e4e6eb';
const BORDER_RADIUS_XL = 30;

export const styles = StyleSheet.create({
    // --- Base & Root Styles ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    keyboardAvoidingContainer: {
        flex: 1,
        borderTopLeftRadius: BORDER_RADIUS_XL,
        borderTopRightRadius: BORDER_RADIUS_XL,
        overflow: 'hidden',
        marginTop: 100,
    },
    container: {
        flex: 1,
        backgroundColor: SECONDARY_BG,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.2, shadowRadius: 10 },
            android: { elevation: 15 },
        }),
    },
    divider: { 
        height: 1, 
        backgroundColor: '#ebedf0' 
    },
    selectUserText: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: SECONDARY_BG 
    },

    // --- Header Styles ---
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: 'white',
    },
    headerButton: { padding: 5 },
    userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 15 },
    headerAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
    headerName: { fontWeight: '700', fontSize: 18, color: '#1c1e21' },
    activeStatus: { fontSize: 13, color: '#606770' },

    // --- User Selector Styles ---
    userSelectorList: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ebedf0', maxHeight: 100 },
    userListContent: { paddingHorizontal: 15, alignItems: 'center' },
    userItem: { alignItems: "center", justifyContent: 'center', marginRight: 25, paddingVertical: 5 },
    selectedUser: { 
        borderBottomWidth: 3, 
        borderBottomColor: PRIMARY_BLUE 
    },
    avatar: { width: 55, height: 55, borderRadius: 27.5, marginBottom: 5 },
    userName: { fontSize: 13, color: '#606770' },
    selectedUserNameActive: { 
        fontWeight: '700', 
        color: PRIMARY_BLUE 
    },

    // --- Chat/Message Styles ---
    chatArea: { flex: 1, paddingHorizontal: 10 },
    messages: { flex: 1 },
    messageListContent: { paddingBottom: 15, paddingTop: 10 },
    messageRow: { flexDirection: 'row', marginVertical: 3, alignItems: 'flex-end' },
    messageBubble: { maxWidth: "80%", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
    myMessage: { 
        backgroundColor: PRIMARY_BLUE, 
        borderBottomRightRadius: 6, 
        marginRight: 8 
    },
    theirMessage: { 
        backgroundColor: THEM_BUBBLE_COLOR, 
        borderBottomLeftRadius: 6, 
        marginLeft: 8 
    },
    msgAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 5, alignSelf: 'flex-end' },
    inputContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#ebedf0',
    },
    input: {
        flex: 1,
        backgroundColor: THEM_BUBBLE_COLOR, 
        borderRadius: 25,
        paddingHorizontal: 18,
        paddingVertical: 10,
        fontSize: 16,
        maxHeight: 120,
        minHeight: 45,
        marginHorizontal: 8,
    },
    iconButton: { padding: 5, marginBottom: 4 },
    sendButton: {
        padding: 2,
        backgroundColor: PRIMARY_BLUE, 
        borderRadius: 25,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});