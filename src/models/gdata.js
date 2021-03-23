export default {
  state: {
    fontSize: 24,
    txtLen: 10000,
    userInfo:null,
    natureList:[]
  },

  reducers: {
    changeFontSize(prevState, data) {
      return {...prevState,fontSize:data};
    },
    changeTxtLen(prevState, data) {
      return {...prevState,txtLen:data};
    },
    changeUserInfo(prevState, data) {
      return {...prevState,userInfo:data};
    },
    changeNature(prevState, data) {
      return {...prevState,natureList:data};
    },
  },
};
