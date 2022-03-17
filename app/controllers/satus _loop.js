for(var i=0;i<status_list.length;i++)
                                    {
                                        for(var j=0;j<all_complaint.length;j++)
                                             {
                                                // console.log('daaaaaaaaaaaaa status  [i] : ',all_complaint[j].comment_status)
                
                                               if(all_complaint[j].comment_status==status_list[i])
                                               {
                                                   var k=1;
                                                    console.log('daaaaaaaaaaaaa status List [i] : ',all_complaint[j].complain_id)
                                                    result_code_array[k]=all_complaint
                                                    k++;
                                                    // console.log('daaaaaaaaaaaaa status List [i] : ',result_code_array[k])
                                                }
                                            }
                                // console.log('result_code_array' ,i,': ',result_code_array)
                                    }               